import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const pages = JSON.parse(
  await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"),
);
const page = pages["/portfolio/projects/auralogbook/"];
const diagramUrl = "/assets/auralogbook-architecture.svg";

test("AuraLogbook page includes one accessible data-to-API-to-UI architecture diagram", async () => {
  assert.ok(page, "the generated AuraLogbook route exists");
  assert.match(page, /href="#architecture">Architecture diagram<\/a>/);
  assert.match(page, /id="architecture"/);
  assert.match(page, new RegExp(`src="${diagramUrl}"`));
  assert.match(page, /alt="Architecture diagram with three columns:[^"]+"/);

  const diagram = await readFile(
    new URL("../static-source/assets/auralogbook-architecture.svg", import.meta.url),
    "utf8",
  );
  for (const term of [
    "users.json",
    "moods.json",
    "zodiacInsights.json",
    "ASP.NET Core · .NET 9",
    "Weatherbit",
    "React 19 · TypeScript",
    "User-provided data",
    "Sign in and onboarding",
    "Mood journal",
    "Personal dashboard",
    "Mood distribution · timeline charts",
    "JWT bearer tokens",
    "BCrypt password hashing",
    "SQLite + Dapper packages are present",
    "Swagger / Swashbuckle",
    "Redux Toolkit + React Redux",
    "React Hook Form + Yup validation",
    "xUnit + Moq",
    "Vitest + Testing Library",
  ]) {
    assert.ok(diagram.includes(term), `diagram includes ${term}`);
  }
  assert.match(diagram, /aria-labelledby="title description"/);

  assert.doesNotMatch(page, /Selected UI dependencies|architecture-dependencies/);
});
