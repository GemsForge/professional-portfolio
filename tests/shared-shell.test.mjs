import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { addDeveloperLibraryNavigation } from "../scripts/portfolio-navigation.mjs";

const header = await readFile("components/site-header.tsx", "utf8");
const footer = await readFile("components/site-footer.tsx", "utf8");
const renderer = await readFile("components/portfolio-page.tsx", "utf8");
const projectCard = await readFile("components/project-card.tsx", "utf8");
const knowledgeDirectory = await readFile("components/knowledge-directory.tsx", "utf8");
const knowledgeReader = await readFile("components/knowledge-reader.tsx", "utf8");
const catalog = await readFile("scripts/project-catalog.mts", "utf8");
const rootRoute = await readFile("app/page.tsx", "utf8");
const route = await readFile("app/[...slug]/page.tsx", "utf8");
const worker = await readFile("build/sites-worker.ts", "utf8");
const css = await readFile("static-source/assets/site.css", "utf8");

test("the routed portfolio page owns the shared shell", () => {
  assert.match(renderer, /<SiteHeader pathname=\{pathname\} \/>/);
  assert.match(renderer, /<SiteFooter \/>/);
  assert.equal((renderer.match(/<SiteHeader/g) ?? []).length, 1);
  assert.equal((renderer.match(/<SiteFooter/g) ?? []).length, 1);
  assert.match(renderer, /cleanPage\(page\)/);
  assert.match(renderer, /replace\(\/<header>/);
  assert.match(renderer, /replace\(\/<footer/);
});

test("the catch-all route delegates every view to the shared renderer", () => {
  assert.match(route, /PortfolioPage/);
  assert.match(route, /params/);
  assert.match(rootRoute, /PortfolioPage/);
  assert.match(rootRoute, /pathname="\/"/);
});

test("shared navigation exposes accessible active state for nested project routes", () => {
  assert.match(header, /aria-label="Portfolio navigation"/);
  assert.match(header, /\["\/knowledge\/", "Knowledge"\]/);
  assert.match(header, /pathname\.startsWith\("\/portfolio\/projects\/"\)/);
  assert.match(header, /aria-current=\{isActive\(href\) \? "page"/);
  assert.match(footer, /aria-label="Footer navigation"/);
  assert.match(renderer, /href="#main"|id="main"/);
});

test("site and owner navigation use native anchors for reliable full-page routing", () => {
  for (const component of [header, footer, projectCard, knowledgeDirectory, knowledgeReader]) {
    assert.doesNotMatch(component, /from ["']next\/link["']/);
    assert.match(component, /<a\b[^>]*href=/);
  }
  assert.match(footer, /<a href="\/admin\/">Admin<\/a>/);
  assert.match(knowledgeDirectory, /<a[^>]+href="\/admin\/knowledge\/handbooks\/"/);
});

test("normal-click destinations remain present in the generated portfolio route map", async () => {
  const pages = JSON.parse(await readFile("lib/static-pages.json", "utf8"));
  for (const pathname of ["/", "/portfolio/projects/", "/about/", "/contact/"]) {
    assert.ok(pages[pathname], `normal navigation destination is missing: ${pathname}`);
  }
  assert.match(worker, /url\.pathname === ['"]\/admin['"] \|\| url\.pathname === ['"]\/admin\/['"]/);
  assert.match(worker, /adminPageRequest\(request,managerPage\)/);
  for (const pathname of ["/admin/knowledge/", "/admin/knowledge/handbooks/"]) {
    assert.match(knowledgeDirectory, new RegExp(`href=[\"']${pathname.replaceAll("/", "\\/")}`));
  }
});

test("every static page source produces a header with one Developer Library link", async () => {
  async function findPages(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) return findPages(file);
      return entry.name === "index.html" ? [file] : [];
    }));
    return nested.flat();
  }

  const sourceFiles = await findPages("static-source");
  assert.ok(sourceFiles.length > 0);
  for (const file of sourceFiles) {
    const html = await readFile(file, "utf8");
    const transformed = addDeveloperLibraryNavigation(html, file);
    assert.equal(addDeveloperLibraryNavigation(transformed, file), transformed, `Header link duplicated in ${file}`);
    const primaryNavigation = transformed.match(/<nav class="links" aria-label="Portfolio navigation">([\s\S]*?)<\/nav>/)?.[1] ?? "";
    assert.equal((primaryNavigation.match(/href="\/knowledge\/"/g) ?? []).length, 1, `Knowledge link missing or duplicated in ${file}`);
  }

  const attachmentManager = await readFile("lib/image-manager.html", "utf8");
  assert.match(attachmentManager, /<nav class="links" aria-label="Portfolio navigation">[^<]*<a href="\/portfolio\/projects\/">Projects<\/a><!-- Keep the public library accessible from owner-tool headers too\. --><a href="\/knowledge\/">Knowledge<\/a>/);
});

test("the generated page catalog includes the required public routes", async () => {
  const pages = JSON.parse(await readFile("lib/static-pages.json", "utf8"));
  for (const pathname of [
    "/",
    "/about/",
    "/contact/",
    "/portfolio/projects/",
    "/work/",
    "/portfolio/projects/auralogbook/",
  ]) {
    assert.ok(pages[pathname], `missing generated route ${pathname}`);
  }
});

test("project cards consume the shared catalog and are mounted on all project indexes", () => {
  assert.match(projectCard, /ProjectDefinition/);
  assert.match(projectCard, /project\.name|project\.cardTitle/);
  assert.match(projectCard, /project\.description/);
  assert.match(projectCard, /project\.preTitle/);
  assert.match(projectCard, /project\.technologies\.map/);
  assert.match(projectCard, /project\.image/);
  assert.match(projectCard, /project\.slug/);
  assert.match(projectCard, /Object\.values\(PROJECTS\)/);
  assert.match(renderer, /ProjectCardGrid/);
  assert.match(renderer, /HOME_PROJECT_SLUGS/);
  assert.match(catalog, /"auralogbook"/);
  assert.match(catalog, /"75-hard-automation"/);
  assert.match(catalog, /"apple-ecosystem"/);
  assert.match(projectCard, /Explore more projects/);
  assert.match(projectCard, /\/portfolio\/projects\//);
  assert.match(renderer, /pathname === "\/portfolio\/projects\/"/);
  assert.match(catalog, /applyProjectPageMetadata/);
  assert.match(catalog, /renderProjectCard/);
});

test("portfolio project cards render labeled technology marks in both page renderers", () => {
  for (const source of [catalog, projectCard]) {
    assert.match(source, /from "simple-icons"/);
    for (const icon of ["siApple", "siNotion", "siReact", "siTypescript", "siDotnet", "siMui", "siRedux"]) {
      assert.ok(source.includes(icon), `missing official Simple Icons export: ${icon}`);
    }
  }
  assert.match(catalog, /technologies: \{ label: string; icon\?: string \}\[\]/);
  assert.match(catalog, /class="tech-chip"/);
  assert.match(catalog, /<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">/);
  assert.match(projectCard, /project\.technologies\.map/);
  assert.match(projectCard, /aria-label="Technologies and project themes"/);
  assert.match(css, /\.tech-chip\{[\s\S]*?font-size:12px/);
});

test("project-card labels leave their decorative arrow to the shared style", () => {
  assert.match(catalog, /cardLinkLabel: "Explore Aura Logbook"/);
  assert.doesNotMatch(catalog, /cardLinkLabel: "Explore Aura Logbook ↗"/);
  assert.match(css, /\.worklink:after\{content:/);
  assert.match(projectCard, /project\.cardLinkLabel/);
});

test("portfolio cards and actions use the shared glass and focus treatments", () => {
  assert.match(css, /--glass:rgba\(/);
  assert.match(css, /\.project\{[^}]*linear-gradient/);
  assert.match(css, /\.project:hover\{[^}]*translateY\(-5px\)/);
  assert.match(css, /\.button\{[^}]*border-radius:999px/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /a:focus-visible,button:focus-visible,summary:focus-visible/);
});
