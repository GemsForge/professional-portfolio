import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  AURALOGBOOK_DEPENDENCIES,
  AURALOGBOOK_DEPENDENCY_GROUPS,
  renderDependencyGroup,
} from "../scripts/auralogbook-dependencies.mjs";

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
  assert.match(page, /id="data-sources"/);
  assert.match(page, /Mindful Living, Astrology &amp; Energy, or Faith &amp; Religion/);
  assert.match(page, /connecting a typed frontend to a \.NET API/);
  assert.match(page, /small database such as SQLite/);
  assert.match(page, /migration is future work/);
  assert.match(page, /dependency-chip-list/);
  assert.match(page, /What this demonstrates/);
  assert.match(page, /aura-logbook-api\/blob\/master\/AuraLogbook.Api\/Models\/MoodEntry.cs/);
  assert.doesNotMatch(page, /data-dependency-group=/);

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

test("AuraLogbook dependency badges come from the typed registry with inline brand marks", () => {
  assert.doesNotMatch(page, /Selected frontend tools|dependency-panel/);
  for (const group of Object.values(AURALOGBOOK_DEPENDENCY_GROUPS)) {
    for (const id of group.ids) {
      const dependency = AURALOGBOOK_DEPENDENCIES[id];
      assert.ok(dependency, `registry entry exists for ${id}`);
      assert.ok(dependency.label, `registry entry ${id} has a visible label`);
      assert.ok(dependency.logo, `registry entry ${id} has a logo source`);
      assert.match(dependency.sourceUrl, /^https:\/\//, `registry entry ${id} has an HTTPS source webpage`);
      assert.ok(dependency.logo.symbolId, `registry entry ${id} has a logo symbolId`);
      assert.ok(dependency.logo.description, `registry entry ${id} has a logo description`);
      if (dependency.logo.kind === "file") {
        assert.ok(dependency.logo.src, `file-backed logo ${id} has a source`);
      }
      assert.ok(dependency.status, `registry entry ${id} documents its implementation status`);
    }
  }

  const heroBadges = renderDependencyGroup("portfolioHighlights");
  assert.match(heroBadges, /data-dependency="csharp"/);
  assert.match(heroBadges, /C#<\/span>/);
  assert.match(heroBadges, /data-dependency="dotnet"/);
  assert.match(heroBadges, /#brand-dotnet/);
  assert.match(heroBadges, /data-dependency="mui"/);
  assert.match(heroBadges, /#brand-mui/);
  assert.match(heroBadges, /data-dependency="redux"[^>]*>/);
  assert.match(heroBadges, /src="\/assets\/auralogbook-stack\/redux\.png"/);
  assert.match(heroBadges, /data-dependency="react_router"[^>]*>/);
  assert.match(heroBadges, /src="\/assets\/auralogbook-stack\/react-router\.png"/);
  assert.match(heroBadges, /data-dependency="dotnet"[^>]*data-status="active"/);
  assert.match(heroBadges, /data-dependency="dapper"[^>]*data-status="declared-not-wired"/);
  assert.match(heroBadges, /Dapper · declared, not wired/);
  assert.match(heroBadges, /data-dependency="sqlite"[^>]*data-status="declared-not-wired"/);
  assert.match(heroBadges, /data-dependency="swagger"[^>]*data-status="active"/);
  assert.match(heroBadges, /src="\/assets\/auralogbook-stack\/swagger\.png"/);

  const workflowTools = renderDependencyGroup("workflowTools");
  for (const id of ["notion", "apple_shortcuts", "apple_numbers", "apple_notes", "apple_freeform", "apple_reminders", "apple_calendar", "apple_siri", "apple_icloud"]) {
    assert.match(workflowTools, new RegExp(`data-dependency="${id}"`));
  }
  for (const id of ["apple_shortcuts", "apple_numbers", "apple_notes", "apple_freeform", "apple_reminders", "apple_calendar", "apple_siri", "apple_icloud"]) {
    assert.match(workflowTools, new RegExp(`data-dependency="${id}"[^>]*><svg[^>]*data-logo-symbol="brand-apple"`));
  }
});
