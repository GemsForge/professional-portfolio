import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const pages = JSON.parse(
  await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"),
);
const page = pages["/portfolio/projects/auralogbook/"];
const diagramUrl = "/assets/aura-logbook-architecture.svg";

test("AuraLogbook page includes one accessible data-to-API-to-UI architecture diagram", async () => {
  assert.ok(page, "the generated AuraLogbook route exists");
  assert.match(page, /href="#architecture">Architecture diagram<\/a>/);
  assert.match(page, /id="architecture"/);
  assert.match(page, new RegExp(`src="${diagramUrl}"`));
  assert.match(page, /aria-label="Click to zoom the Aura Logbook architecture diagram"/);
  assert.match(page, /id="architecture-dialog"/);
  assert.match(page, /class="architecture-zoom-area"/);
  assert.match(page, /aria-describedby="architecture-tech-list"/);

  const diagram = await readFile(
    new URL("../static-source/assets/aura-logbook-architecture.svg", import.meta.url),
    "utf8",
  );
  for (const term of [
    "Data/users.json",
    "Data/moods.json",
    "zodiacInsights.json",
    "User (browser)",
    "Frontend · aura-ui",
    "API · AuraLogbook.Api",
    "Data/users.json",
    "Data/moods.json",
    "zodiacInsights.json",
    "Open-Meteo API",
    "api.open-meteo.com",
    "JWT",
    "BCrypt",
    "Redux store (RTK Query)",
    "SQLite + Dapper: declared, not wired to storage",
    "Dependency key",
  ]) {
    assert.ok(diagram.includes(term), `diagram includes ${term}`);
  }
  assert.match(diagram, /<title id="title">Aura Logbook full-stack architecture<\/title>/);
  assert.doesNotMatch(diagram, /Weatherbit/);

  assert.doesNotMatch(page, /Selected UI dependencies|architecture-dependencies/);
});
