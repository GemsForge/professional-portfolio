import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const header = await readFile("components/site-header.tsx", "utf8");
const footer = await readFile("components/site-footer.tsx", "utf8");
const renderer = await readFile("components/portfolio-page.tsx", "utf8");
const projectCard = await readFile("components/project-card.tsx", "utf8");
const catalog = await readFile("scripts/project-catalog.mts", "utf8");
const route = await readFile("app/[[...slug]]/page.tsx", "utf8");

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
});

test("shared navigation exposes accessible active state for nested project routes", () => {
  assert.match(header, /aria-label="Portfolio navigation"/);
  assert.match(header, /pathname\.startsWith\("\/portfolio\/projects\/"\)/);
  assert.match(header, /aria-current=\{isActive\(href\) \? "page"/);
  assert.match(footer, /aria-label="Footer navigation"/);
  assert.match(renderer, /href="#main"|id="main"/);
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
  assert.match(projectCard, /project\.primaryTools/);
  assert.match(projectCard, /project\.image/);
  assert.match(projectCard, /project\.slug/);
  assert.match(projectCard, /Object\.values\(PROJECTS\)/);
  assert.match(renderer, /ProjectCardGrid/);
  assert.match(renderer, /pathname === "\/portfolio\/projects\/"/);
  assert.match(catalog, /applyProjectPageMetadata/);
  assert.match(catalog, /renderProjectCard/);
});
