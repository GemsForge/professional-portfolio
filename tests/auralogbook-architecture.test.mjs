import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  AURALOGBOOK_DEPENDENCIES,
  AURALOGBOOK_DEPENDENCY_GROUPS,
  renderDependencyGroup,
} from "../scripts/auralogbook-dependencies.mts";

const pages = JSON.parse(
  await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"),
);
const page = pages["/portfolio/projects/auralogbook/"];
const disciplinePage = pages["/portfolio/projects/75-hard-automation/"];
const diagramUrl = "/assets/aura-logbook-architecture.svg";

test("AuraLogbook page includes one accessible data-to-API-to-UI architecture diagram", async () => {
  assert.ok(page, "the generated AuraLogbook route exists");
  assert.match(page, /href="#architecture">Architecture diagram<\/a>/);
  assert.match(page, /href="#journey">User journey<\/a>/);
  assert.match(page, /id="journey" aria-labelledby="journey-heading"/);
  assert.match(page, /A path from check-in to reflection/);
  for (const stage of ["Register or sign in", "Log a check-in", "Review your history", "Explore patterns"]) {
    assert.ok(page.includes(stage), `user journey includes ${stage}`);
  }
  assert.doesNotMatch(page, /In development|still in progress|remain in progress|Current state &amp; next steps/);
  assert.match(page, /React Native\/Expo shell organizes Today, Log, Journal, and Profile through native navigation/);
  assert.match(page, /mobile-first journal for what you feel and believe/);
  assert.match(page, /choosing the perspective that fits them/);
  assert.match(page, /light, dark, and system appearance choices make the journal feel personal/);
  assert.match(page, /Browse entries by date range, then edit or delete them/);
  assert.match(page, /responsive React 19\/TypeScript web client, which uses Material UI, Joy UI/);
  assert.match(page, /targets \.NET 9/);
  assert.match(page, /SQLite persistence is implemented through Dapper repositories and versioned SQL migrations in Development and FIT\/Staging/);
  assert.match(page, /Frontend tests use Vitest and Testing Library; API tests use xUnit and Moq/);
  assert.match(page, /AuraLogbook\.Api\.Tests\/MoodServiceTests\.cs/);
  assert.match(page, /aura-ui\/src\/pages\/tests\/MoodHistory\.test\.tsx/);
  assert.match(page, /Controllers\/AuthController\.cs/);
  assert.match(page, /Repositories\/SqliteMoodRepository\.cs/);
  assert.match(page, /Repositories\/SqliteUserRepository\.cs/);
  assert.match(page, /not that every suite currently passes/);
  assert.doesNotMatch(page, /only renders a test page|source inspection has not established.*tests/i);
  assert.match(page, /id="architecture"/);
  assert.match(page, new RegExp(`src="${diagramUrl}"`));
  assert.match(page, /aria-label="Click to zoom the Aura Logbook architecture diagram"/);
  assert.match(page, /id="architecture-dialog"/);
  assert.match(page, /class="architecture-zoom-area"/);
  assert.match(page, /aria-describedby="architecture-tech-list"/);
  assert.match(page, /id="data-sources"/);
  assert.match(page, /src="\/assets\/auralogbook-tour\/aura-logbook-approved\.webp" alt=""/);
  assert.equal((page.match(/data-aura-image-trigger/g) ?? []).length, 11, "the hero and ten screen captures open in the closer-look dialog");
  assert.match(page, /<dialog id="aura-image-dialog" class="aura-image-dialog"/);
  assert.match(page, /aria-label="Enlarged Aura Logbook screen\. Swipe or scroll sideways to view the full image\."/);
  assert.match(page, /Mindful Living, Astrology &amp; Energy, or Faith &amp; Religion/);
  for (const screen of ["public-home", "individual-record", "gallery", "appearance", "spotify"]) {
    assert.ok(page.includes(`/assets/auralogbook-tour/${screen}-pair.png`), `walkthrough includes the ${screen} capture`);
  }
  assert.match(page, /Open-Meteo for New York City on November 12, 2026/);
  assert.match(page, /Frontline by Butcher Brown/);
  assert.match(page, /Discover Weekly, daylist, and Your Summer Rewind/);
  assert.match(page, /Music for the moment/);
  assert.match(page, /Spotify linking uses OAuth Authorization Code with PKCE/);
  assert.match(page, /Playlist links and the now-playing link continue in Spotify/);
  assert.doesNotMatch(page, /authenticated API integration, secure session handling|next step is to connect the native shell/);
  assert.match(page, /portfolio demo; no Spotify account or personal listening data is used/);
  const captureNotes = await readFile(new URL("../docs/story-assets/aura-logbook-walkthrough-capture-notes.md", import.meta.url), "utf8");
  assert.match(captureNotes, /not Aura's latest merged commit `5913d26`/);
  assert.match(captureNotes, /fictional Alex Morgan profile and synthetic journal entries/);
  assert.match(captureNotes, /“Frontline” by Butcher Brown/);
  assert.match(captureNotes, /phone chrome, local IP address, or profile details are included/);
  assert.match(page, /shaping the phone-first experience, its responsive desktop companion/);
  assert.match(page, /SQLite persistence is implemented through Dapper repositories and versioned SQL migrations/);
  assert.doesNotMatch(page, /FileMoodRepository|FileUserRepository|JSON-based persistence/);
  assert.match(page, /dependency-chip-list/);
  assert.match(page, /What this demonstrates/);
  assert.match(page, /aura-logbook-api\/blob\/master\/AuraLogbook.Api\/Models\/MoodEntry.cs/);
  assert.doesNotMatch(page, /data-dependency-group=/);

  const diagram = await readFile(
    new URL("../static-source/assets/aura-logbook-architecture.svg", import.meta.url),
    "utf8",
  );
  for (const term of [
    "PHONE-FIRST PRODUCT JOURNEY",
    "Responsive React",
    "Auth API issues JWT",
    ".NET 9 API",
    "Controllers",
    "Services",
    "Dapper repositories",
    "SQLite",
    "Versioned migrations",
    "Development + FIT/Staging",
    "OPTIONAL PHOTO",
    "Private media storage",
    "Attachment",
    "NATIVE APP NAVIGATION",
    "Native navigation destinations",
  ]) {
    assert.ok(diagram.includes(term), `diagram includes ${term}`);
  }
  assert.doesNotMatch(diagram, /IN PROGRESS|Still in progress/);
  assert.doesNotMatch(page, /authenticated API integration remains in progress|shell in progress/);
  assert.match(diagram, /<title id="title">Aura Logbook phone-first product journey and data path<\/title>/);
  assert.doesNotMatch(diagram, /\.json|FileMoodRepository|System\.Text\.Json/i);
  assert.doesNotMatch(diagram, /Weatherbit/);

  assert.doesNotMatch(page, /Selected UI dependencies|architecture-dependencies/);
});

test("AuraLogbook journey and resource layout stay responsive and readable", async () => {
  const css = await readFile(new URL("../static-source/assets/site.css", import.meta.url), "utf8");
  assert.match(css, /\.case-content \.mood-workflow\{[^}]*display:grid/);
  assert.match(css, /@media\(max-width:450px\)\{\.case-content \.mood-workflow\{grid-template-columns:minmax\(0,1fr\)\}\}/);
  assert.match(page, /<ol class="mood-workflow">[\s\S]*?<\/ol>/);
});

test("AuraLogbook dependency badges come from the typed registry with inline brand marks", async () => {
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
  assert.match(heroBadges, /data-dependency="vite"/);
  assert.match(heroBadges, /#brand-vite/);
  assert.match(heroBadges, /data-dependency="redux"[^>]*>/);
  assert.match(heroBadges, /src="\/assets\/auralogbook-stack\/redux\.png"/);
  assert.match(heroBadges, /data-dependency="react_router"[^>]*>/);
  assert.match(heroBadges, /src="\/assets\/auralogbook-stack\/react-router\.png"/);
  assert.match(heroBadges, /data-dependency="dotnet"[^>]*data-status="active"/);
  assert.match(heroBadges, /data-dependency="dapper"[^>]*data-status="active"/);
  assert.match(heroBadges, />Dapper</);
  assert.equal(AURALOGBOOK_DEPENDENCIES.dapper.status, "active");
  assert.match(heroBadges, /data-dependency="sqlite"[^>]*data-status="active"/);
  assert.match(heroBadges, /data-dependency="swagger"[^>]*data-status="active"/);
  assert.match(heroBadges, /src="\/assets\/auralogbook-stack\/swagger\.png"/);
  assert.match(heroBadges, /href="https:\/\/react\.dev\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(heroBadges, /aria-label="Open React source in a new tab"/);

  const imageDialogScript = await readFile(new URL("../static-source/assets/auralogbook-image-dialog.js", import.meta.url), "utf8");
  const imageDialogStyles = await readFile(new URL("../static-source/assets/auralogbook-image-dialog.css", import.meta.url), "utf8");
  assert.match(imageDialogScript, /dialog\.showModal\(\)/);
  assert.match(imageDialogScript, /lastTrigger\.focus\(\)/);
  assert.match(imageDialogScript, /event\.target === dialog/);
  assert.match(imageDialogStyles, /\.aura-image-dialog-viewport img\{width:200vw/);
  assert.match(imageDialogStyles, /\.aura-image-dialog\{position:fixed;inset:0;width:100dvw;height:100dvh/);

  const workflowTools = renderDependencyGroup("workflowTools");
  for (const id of ["notion", "apple_shortcuts", "apple_numbers", "apple_notes", "apple_freeform", "apple_reminders", "apple_calendar", "apple_siri", "apple_icloud"]) {
    assert.match(workflowTools, new RegExp(`data-dependency="${id}"`));
  }
  for (const id of ["apple_shortcuts", "apple_numbers", "apple_notes", "apple_freeform", "apple_reminders", "apple_calendar", "apple_siri", "apple_icloud"]) {
    assert.match(workflowTools, new RegExp(`data-dependency="${id}"[^>]*><svg[^>]*data-logo-symbol="brand-apple"`));
  }

  const disciplineTools = renderDependencyGroup("disciplineHighlights");
  assert.ok(disciplinePage, "the generated 75 Days of Discipline route exists");
  for (const dependency of Object.values(AURALOGBOOK_DEPENDENCIES).filter(({ id }) => ["notion", "apple_shortcuts"].includes(id))) {
    assert.match(disciplineTools, new RegExp(`data-dependency="${dependency.id}"[^>]*href="${dependency.sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(disciplineTools, new RegExp(`aria-label="Open ${dependency.label} source in a new tab"`));
  }
  assert.match(disciplinePage, /data-dependency="notion"[^>]*href="https:\/\/www\.notion\.so\//);
  assert.match(disciplinePage, /data-dependency="apple_shortcuts"[^>]*href="https:\/\/developer\.apple\.com\//);
});
