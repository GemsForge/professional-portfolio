import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const pages = JSON.parse(
  await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"),
);
const page = pages["/portfolio/projects/auralogbook/"];
const diagramUrl = "/assets/auralogbook-architecture.svg";

test("AuraLogbook page includes the accessible architecture diagram and stack marks", async () => {
  assert.ok(page, "the generated AuraLogbook route exists");
  assert.match(page, /href="#architecture">Architecture diagram<\/a>/);
  assert.match(page, /id="architecture"/);
  assert.match(page, new RegExp(`src="${diagramUrl}"`));
  assert.match(page, /alt="AuraLogbook architecture,[^"]+"/);

  const diagram = await readFile(
    new URL("../static-source/assets/auralogbook-architecture.svg", import.meta.url),
    "utf8",
  );
  for (const term of [
    "users.json",
    "moods.json",
    "zodiacInsights.json",
    "ASP.NET Core Web API",
    "Weatherbit",
    "React application",
    "requests",
    "write",
  ]) {
    assert.ok(diagram.includes(term), `diagram includes ${term}`);
  }
  assert.match(diagram, /aria-labelledby="title description"/);

  for (const logo of ["react.png", "typescript.png", "redux.png", "axios.png"]) {
    assert.match(page, new RegExp(`/assets/auralogbook-stack/${logo}`));
    const logoStats = await stat(
      new URL(`../static-source/assets/auralogbook-stack/${logo}`, import.meta.url),
    );
    assert.ok(logoStats.size > 0, `${logo} is present`);
  }
});
