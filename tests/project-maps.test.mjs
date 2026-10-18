import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Aura Logbook architecture distinguishes active storage from declared packages", async () => {
  const svg = await read("../static-source/assets/aura-logbook-architecture.svg");
  const architecturePage = await read("../static-source/portfolio/projects/auralogbook/architecture.html");

  assert.match(svg, /Active persistence: System\.Text\.Json files/);
  assert.match(svg, /SQLite \+ Dapper: declared, not wired to storage/);
  assert.match(svg, /Open-Meteo API/);
  assert.doesNotMatch(svg, /Weatherbit/);
  assert.match(svg, /aria-labelledby="title desc"/);
  assert.match(architecturePage, /SQLite and Dapper are declared dependencies but are not wired to storage/);
  assert.match(architecturePage, /Open-Meteo weather/);
  assert.match(architecturePage, /aria-describedby="architecture-tech-list"/);
  assert.match(architecturePage, /id="architecture-tech-list"/);
  for (const technology of ["React", "TypeScript", "Material UI", "Redux Toolkit", "Axios", "JWT Bearer", "Swashbuckle", "System.Text.Json", "Open-Meteo"]) {
    assert.ok(architecturePage.includes(technology), `missing accessible dependency label: ${technology}`);
  }
});

for (const [name, path, labels] of [
  ["Hair Log", "../static-source/portfolio/projects/hair-log/index.html", ["Apple Shortcuts", "Notion API", "Apple Calendar", "Hair Care HTTP Request"]],
  ["75 Hard", "../static-source/portfolio/projects/75-hard-automation/index.html", ["Discipline Http Request", "Notion API", "Date context", "Finch"]],
]) {
  test(`${name} page has a keyboard-accessible Tool / Responsibility table`, async () => {
    const html = await read(path);
    assert.match(html, /<caption>Tool \/ Responsibility<\/caption>/);
    assert.match(html, /<th scope="col">Tool or data source<\/th>/);
    assert.match(html, /<th scope="col">Responsibility<\/th>/);
    assert.match(html, /class="table-scroll" role="region" tabindex="0"/);
    for (const label of labels) assert.ok(html.includes(label), `missing table content: ${label}`);
  });
}
