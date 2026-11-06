import { cp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
// Node 22.13+ strips the catalog's TypeScript types at import time; no runtime
// transpiler or JSX dependency is needed for this build-time-only module.
import { renderDependencyGroup } from "./auralogbook-dependencies.mts";
import { applyProjectPageMetadata, HOME_PROJECT_SLUGS, PROJECTS, renderProjectCard } from "./project-catalog.mts";
import { addDeveloperLibraryNavigation } from "./portfolio-navigation.mjs";

const source = path.resolve("static-source");
const pages = {};

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (entry.name !== "index.html") continue;

    let route = `/${path.relative(source, directory).split(path.sep).filter(Boolean).join("/")}`;
    route = route === "/" ? route : `${route}/`;
    let text = await readFile(file, "utf8");

    // Keep the public Developer Library reachable in every generated page header.
    text = addDeveloperLibraryNavigation(text, route);

    const project = PROJECTS[route.split("/").filter(Boolean).at(-1) ?? ""];
    if (project) text = applyProjectPageMetadata(text, project);

    if (route === "/" || route === "/portfolio/" || route === "/portfolio/projects/") {
      const projects = route === "/" || route === "/portfolio/"
        ? HOME_PROJECT_SLUGS.map((slug) => PROJECTS[slug])
        : Object.values(PROJECTS);

      if (route === "/" || route === "/portfolio/") {
        text = text.replace(
          /<div class="projects">[\s\S]*?<\/div>(?=<\/div><\/section>)/,
          `<div class="projects">${projects.map((project) => renderProjectCard(project)).join("")}</div><div class="project-grid-actions"><a class="button secondary" href="/portfolio/projects/">Explore more projects ↗</a></div>`,
        );
      }

      for (const project of projects) {
        text = text.replace(
          new RegExp(`<article class="project"><a href="/portfolio/projects/${project.slug}/"[\\s\\S]*?<\\/article>`),
          renderProjectCard(project),
        );
      }
    }

    // Keep the product name readable in user-facing portfolio copy while
    // preserving AuraLogbook for technical identifiers and source links.
    text = text
      .replace(/>AuraLogbook</g, ">Aura Logbook<")
      .replace(/Explore AuraLogbook/g, "Explore Aura Logbook")
      .replace(/Next: AuraLogbook/g, "Next: Aura Logbook")
      .replace(/AuraLogbook is/g, "Aura Logbook is")
      .replace(/<title>AuraLogbook ·/g, "<title>Aura Logbook ·");

    if (route === "/portfolio/projects/auralogbook/") {
      const architecture = await readFile(
        path.join(directory, "architecture.html"),
        "utf8",
      );
      const schemas = await readFile(
        path.join(directory, "schemas.html"),
        "utf8",
      );
      text = text.replace(
        '<div id="auralogbook-architecture-slot"></div>',
        `${architecture}${schemas}`,
      );
      text = text.replace(
        /<div data-dependency-group="([a-zA-Z0-9-]+)"><\/div>/g,
        (_match, groupId) => renderDependencyGroup(groupId),
      );
      if (text.includes("data-dependency-group=")) {
        throw new Error("An AuraLogbook dependency group was not rendered.");
      }
    }

    if (route === "/portfolio/projects/75-hard-automation/") {
      text = text.replace(
        /<div data-dependency-group="([a-zA-Z0-9-]+)"><\/div>/g,
        (_match, groupId) => renderDependencyGroup(groupId),
      );
    }

    if (
      route === "/portfolio/projects/hair-log/" ||
      route === "/portfolio/projects/75-hard-automation/"
    ) {
      const slug = route.split("/").filter(Boolean).at(-1);
      const responsibilities = await readFile(
        path.join(source, "portfolio", "projects", slug, "responsibilities.html"),
        "utf8",
      );
      const sectionStart = text.indexOf('<section id="dependencies">');
      const sectionEnd = text.indexOf("</section>", sectionStart);
      if (sectionStart < 0 || sectionEnd < 0) {
        throw new Error(`Missing dependencies section in ${route}`);
      }
      text =
        text.slice(0, sectionStart) +
        responsibilities +
        text.slice(sectionEnd + "</section>".length);
    }

    if (route.startsWith("/portfolio/projects/") && route !== "/portfolio/projects/") {
      const slug = route.split("/").filter(Boolean).at(-1);
      text = text.replace(
        '<nav class="next-project"',
        `<section data-project-gallery="${slug}" hidden></section><nav class="next-project"`,
      );
      text = text.replace(
        "</body>",
        '<script src="/assets/gallery.js" defer></script></body>',
      );
    }

    if (text.includes('<nav aria-label="Footer navigation">')) {
      text = text.replace(
        '<nav aria-label="Footer navigation">',
        '<nav aria-label="Footer navigation"><a href="/admin/">Admin</a>',
      );
    }

    pages[route] = text;
  }
}

await visit(source);
await writeFile("lib/static-pages.json", JSON.stringify(pages));
await cp("static-source/assets", "public/assets", { recursive: true });

// Build a public catalogue from the reviewed Markdown files checked into this
// repository; no workstation-only documentation path is needed at deploy time.
const publicKnowledge = path.resolve("public/knowledge-library");
const knowledgeResources = [];
async function indexKnowledge(directory, relative = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const sourceFile = path.join(directory, entry.name);
    const childRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      await indexKnowledge(sourceFile, childRelative);
      continue;
    }
    if (!entry.name.toLowerCase().endsWith(".md")) continue;
    const markdown = await readFile(sourceFile, "utf8");
    const title = markdown.split(/\r?\n/).find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "").trim()
      ?? path.basename(entry.name, path.extname(entry.name));
    const description = markdown.split(/\r?\n/).map((line) => line.trim()).find((line) => line && !/^#/.test(line) && !/^[-*`>]/.test(line))
      ?? `Reference material for ${title}.`;
    const filePath = childRelative.split(path.sep).map(encodeURIComponent).join("/");
    const id = `library-${createHash("sha256").update(childRelative).digest("hex").slice(0, 24)}`;
    knowledgeResources.push({
      id,
      title,
      folder: path.dirname(childRelative).split(path.sep).join("/"),
      filename: entry.name,
      contentType: "text/markdown",
      size: Buffer.byteLength(markdown),
      description,
      sourceUrl: `/knowledge-library/${filePath}`,
    });
  }
}
await indexKnowledge(publicKnowledge);
knowledgeResources.sort((left, right) => left.title.localeCompare(right.title));
await writeFile(path.join(publicKnowledge, "index.json"), JSON.stringify({ resources: knowledgeResources }));
console.log(`Prepared ${Object.keys(pages).length} portfolio pages.`);
