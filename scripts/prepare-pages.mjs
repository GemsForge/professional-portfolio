import { cp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

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

    if (route === "/portfolio/projects/auralogbook/") {
      const architecture = await readFile(
        path.join(directory, "architecture.html"),
        "utf8",
      );
      text = text.replace('<a href="#implementation">', '<a href="#architecture">Architecture diagram</a><a href="#implementation">');
      text = text.replace('<section id="implementation">', `${architecture}<section id="implementation">`);
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
        "</body>",
        '<script src="/assets/admin-navigation.js" defer></script></body>',
      );
    }

    pages[route] = text;
  }
}

await visit(source);
await writeFile("lib/static-pages.json", JSON.stringify(pages));
await cp("static-source/assets", "public/assets", { recursive: true });
console.log(`Prepared ${Object.keys(pages).length} portfolio pages.`);
