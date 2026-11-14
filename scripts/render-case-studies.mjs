import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
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
/** Build cache for the compiled modules; inside the repo so `react` resolves from node_modules. */
const OUT_DIR = path.resolve("node_modules/.cache/case-studies");

/** Formats diagnostics as `path(line,col): error TSxxxx: message`, relative to the repo. */
function formatDiagnostics(diagnostics) {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => "\n",
  });
}

/** Lists the `.ts`/`.tsx` files in the case study folders as absolute paths. */
async function caseStudySourceFiles() {
  const files = [];
  for (const dir of SOURCE_DIRS) {
    for (const name of await readdir(dir)) if (/\.tsx?$/.test(name)) files.push(path.resolve(dir, name));
  }
  return files;
}

/**
 * Type-checks the given files with the project's tsconfig and, when `outDir`
 * is given, emits them as ES modules in the same TypeScript pass. Type checking
 * matters because the build would otherwise render a mistyped field (e.g.
 * `type: "paragrph"`) as silently missing text.
 *
 * Emitted files keep their repo-relative paths under `outDir`, with relative
 * `.ts`/`.tsx` imports rewritten to `.js`, so the case study folders may only
 * import `react`, each other by relative path, and types from elsewhere.
 *
 * @param {string[]} rootNames Absolute paths of the files to check.
 * @param {string} [outDir] Where to write compiled modules; omit to only check.
 * @throws With every diagnostic and its file location when any check fails.
 */
export function compileCaseStudies(rootNames, outDir) {
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, "tsconfig.json");
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
  if (error) throw new Error(formatDiagnostics([error]));
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));
  const program = ts.createProgram({
    rootNames,
    options: {
      ...options,
      incremental: false,
      noEmit: !outDir,
      outDir,
      // Only emitting needs a root; a check-only run may include files from elsewhere.
      rootDir: outDir ? process.cwd() : undefined,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      rewriteRelativeImportExtensions: true,
      declaration: false,
      sourceMap: false,
    },
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) throw new Error(`Case study content or components failed type checking:\n${formatDiagnostics(diagnostics)}`);
  if (!outDir) return;
  const emitted = program.emit();
  if (emitted.emitSkipped || emitted.diagnostics.length) {
    throw new Error(`Case study modules failed to compile:\n${formatDiagnostics(emitted.diagnostics)}`);
  }
}

/** Drops React 19's hoisted image preloads, matching attributes in any order. */
function stripImagePreloads(html) {
  return html.replace(/<link\b[^>]*>/g, (tag) => (/\brel="preload"/.test(tag) && /\bas="image"/.test(tag) ? "" : tag));
}

/**
 * Renders every registered case study to a complete HTML document, after
 * type-checking and compiling the components and content.
 *
 * @param {Record<string, import("./project-catalog.mts").ProjectDefinition>} projects Catalog projects keyed by slug.
 * @returns {Promise<Map<string, string>>} Document HTML keyed by route, e.g. `/portfolio/projects/dev-wiki/`.
 */
export async function renderCaseStudyPages(projects) {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "package.json"), '{"type":"module"}\n');
  compileCaseStudies(await caseStudySourceFiles(), OUT_DIR);
  const { CASE_STUDIES } = await import(pathToFileURL(path.join(OUT_DIR, "components/case-studies/index.js")).href);
  const pages = new Map();
  for (const [slug, Component] of Object.entries(CASE_STUDIES)) {
    const project = projects[slug];
    if (!project) throw new Error(`Case study "${slug}" has no project in scripts/project-catalog.mts.`);
    // React 19 hoists a preload for every eager <img>; static pages keep their original loading behavior.
    const html = stripImagePreloads(renderToStaticMarkup(createElement(Component, { project, projects })));
    pages.set(`/portfolio/projects/${slug}/`, `<!doctype html>${html}`);
  }
  return pages;
}
