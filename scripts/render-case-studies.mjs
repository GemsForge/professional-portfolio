import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

/**
 * Folders compiled for the case studies: the components with their `index.ts`
 * registry, and the content files they render (#136). Output keeps the
 * repo-relative layout so imports between the two folders still resolve.
 */
const SOURCE_DIRS = ["components/case-studies", "content/case-studies"];
/** Build cache for the transpiled modules; inside the repo so `react` resolves from node_modules. */
const OUT_DIR = path.resolve("node_modules/.cache/case-studies");

/** Formats diagnostics as `path(line,col): error TSxxxx: message`, relative to the repo. */
function formatDiagnostics(diagnostics) {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => "\n",
  });
}

/**
 * Type-checks the case study components and content with the project's
 * tsconfig before rendering. Transpiling alone strips types, so without this a
 * mistyped field (e.g. `type: "paragrph"`) would build and silently drop text.
 *
 * @throws With every diagnostic and its file location when any check fails.
 */
async function typeCheckCaseStudies() {
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, "tsconfig.json");
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
  if (error) throw new Error(formatDiagnostics([error]));
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));
  const rootNames = [];
  for (const dir of SOURCE_DIRS) {
    for (const name of await readdir(dir)) if (/\.tsx?$/.test(name)) rootNames.push(path.resolve(dir, name));
  }
  const program = ts.createProgram({ rootNames, options: { ...options, noEmit: true, incremental: false } });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) throw new Error(`Case study content or components failed type checking:\n${formatDiagnostics(diagnostics)}`);
}

/**
 * Transpiles the case study components and content to ES modules with
 * TypeScript's single-file transpiler. No bundler or JSX loader is involved,
 * so these folders may only import `react` and each other's `.tsx`/`.ts` files
 * by relative path (rewritten to `.js`); other imports must be type-only.
 */
async function transpileCaseStudies() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "package.json"), '{"type":"module"}\n');
  for (const dir of SOURCE_DIRS) {
    await mkdir(path.join(OUT_DIR, dir), { recursive: true });
    for (const name of await readdir(dir)) {
      if (!/\.tsx?$/.test(name)) continue;
      const source = await readFile(path.join(dir, name), "utf8");
      const { outputText, diagnostics } = ts.transpileModule(source, {
        fileName: path.join(dir, name),
        reportDiagnostics: true,
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          verbatimModuleSyntax: false,
          rewriteRelativeImportExtensions: true,
        },
      });
      if (diagnostics?.length) {
        throw new Error(`Cannot transpile ${path.join(dir, name)}:\n${formatDiagnostics(diagnostics)}`);
      }
      await writeFile(path.join(OUT_DIR, dir, name.replace(/\.tsx?$/, ".js")), outputText);
    }
  }
}

/**
 * Renders every registered case study to a complete HTML document, after
 * type-checking the components and content.
 *
 * @param {Record<string, import("./project-catalog.mts").ProjectDefinition>} projects Catalog projects keyed by slug.
 * @returns {Promise<Map<string, string>>} Document HTML keyed by route, e.g. `/portfolio/projects/dev-wiki/`.
 */
export async function renderCaseStudyPages(projects) {
  await typeCheckCaseStudies();
  await transpileCaseStudies();
  const { CASE_STUDIES } = await import(pathToFileURL(path.join(OUT_DIR, "components/case-studies/index.js")).href);
  const pages = new Map();
  for (const [slug, Component] of Object.entries(CASE_STUDIES)) {
    const project = projects[slug];
    if (!project) throw new Error(`Case study "${slug}" has no project in scripts/project-catalog.mts.`);
    const html = renderToStaticMarkup(createElement(Component, { project, projects }))
      // React 19 hoists a preload for every eager <img>; static pages keep their original loading behavior.
      .replace(/<link rel="preload" as="image"[^>]*\/>/g, "");
    pages.set(`/portfolio/projects/${slug}/`, `<!doctype html>${html}`);
  }
  return pages;
}
