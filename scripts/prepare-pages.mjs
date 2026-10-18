import { cp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
// Node 22.13+ strips the catalog's TypeScript types at import time; no runtime
// transpiler or JSX dependency is needed for this build-time-only module.
import { renderDependencyGroup } from "./auralogbook-dependencies.mts";

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
console.log(`Prepared ${Object.keys(pages).length} portfolio pages.`);
