import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
/** Case study pages are React components (#132); assertions read their generated HTML. */
const pages = JSON.parse(await read("../lib/static-pages.json"));

test("Aura Logbook architecture identifies implemented SQLite and Dapper persistence", async () => {
  const svg = await read("../static-source/assets/aura-logbook-architecture.svg");
  const architecturePage = pages["/portfolio/projects/auralogbook/"];

  assert.match(svg, /SQLite/);
  assert.match(svg, /Dapper repositories<\/text>/);
  assert.match(svg, /SQLite\/Dapper is active in Development and FIT\/Staging/);
  assert.doesNotMatch(svg, /Weatherbit/);
  assert.match(svg, /aria-labelledby="title desc"/);
  assert.match(architecturePage, /SQLite persistence through Dapper repositories and versioned SQL migrations/);
  assert.match(architecturePage, /Open-Meteo REST API for contextual weather/);
  assert.match(architecturePage, /aria-describedby="architecture-tech-list"/);
  assert.match(architecturePage, /id="architecture-tech-list"/);
  for (const technology of ["React and TypeScript", "React Native and Expo", "Material UI", "Redux Toolkit", "Axios", ".NET 9", "SQLite persistence", "Open-Meteo"]) {
    assert.ok(architecturePage.includes(technology), `missing accessible dependency label: ${technology}`);
  }
});

for (const [name, route, labels] of [
  ["Hair Log", "/portfolio/projects/hair-log/", ["Apple Shortcuts", "Notion API", "Apple Calendar", "Hair Care HTTP Request"]],
  ["75 Hard", "/portfolio/projects/75-hard-automation/", ["Discipline Http Request", "Notion API", "Date context", "Finch"]],
]) {
  test(`${name} page has a keyboard-accessible Tool / Responsibility table`, async () => {
    const html = pages[route];
    assert.match(html, /<caption>Tool \/ Responsibility<\/caption>/);
    assert.match(html, /<th scope="col">Tool or data source<\/th>/);
    assert.match(html, /<th scope="col">Responsibility<\/th>/);
    assert.match(html, /class="table-scroll" role="region" tabindex="0"/);
    for (const label of labels) assert.ok(html.includes(label), `missing table content: ${label}`);
  });
}

test("Aura Logbook card and detail page share the catalog image", async () => {
  const catalog = await read("../scripts/project-catalog.mts");
  const home = await read("../static-source/index.html");
  const projects = await read("../static-source/portfolio/projects/index.html");
  const detail = pages["/portfolio/projects/auralogbook/"];
  assert.match(catalog, /auralogbook[\s\S]*?image: "\/assets\/auralogbook-tour\/home-card\.png"/);
  assert.match(home, /id="creator-post-grid" class="creator-post-grid"/);
  assert.match(catalog, /slug: "auralogbook", title: "Aura Logbook"[\s\S]*?image: "\/assets\/auralogbook-tour\/home-card\.png"/);
  assert.match(projects, /auralogbook\/[\s\S]*?src="\/assets\/auralogbook-tour\/home-card\.png"/);
  assert.match(detail, /src="\/assets\/auralogbook-tour\/home-pair\.png"/);
});
