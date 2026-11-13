import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/**
 * Guards the #131 projects redesign: the opt-in `rd` layer is applied only to
 * the Projects index and Aura Logbook case study, the social-profile home page
 * stays untouched, and the progressive enhancements keep their accessible hooks.
 */
const pages = JSON.parse(await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"));
const css = await readFile(new URL("../static-source/assets/redesign.css", import.meta.url), "utf8");
const script = await readFile(new URL("../static-source/assets/projects-redesign.js", import.meta.url), "utf8");
const catalog = await readFile(new URL("../scripts/project-catalog.mts", import.meta.url), "utf8");
const REDESIGNED = ["/portfolio/projects/", "/portfolio/projects/auralogbook/"];

test("only redesigned pages opt into the redesign layer", () => {
  for (const route of REDESIGNED) {
    assert.match(pages[route], /<body class="rd">/, `${route} should opt in`);
    assert.match(pages[route], /href="\/assets\/redesign\.css"/);
    assert.match(pages[route], /src="\/assets\/projects-redesign\.js" defer/);
    assert.match(pages[route], /class="rd-handle" href="\/"[\s\S]*?profile-avatar-320\.jpg/);
    assert.match(pages[route], /<a href="\/portfolio\/projects\/" aria-current="page">Projects<\/a>/);
  }
  for (const route of ["/", "/portfolio/", "/about/", "/contact/"]) {
    assert.doesNotMatch(pages[route], /redesign\.css|<body class="rd">/, `${route} must keep its current look`);
  }
  // Every rule is scoped to the opt-in body class or an rd- component class.
  assert.match(css, /^body\.rd\{/m);
  assert.doesNotMatch(css, /^(?:header|main|footer|h1|h2|h3|a|body)\s*\{/m);
});

test("projects index renders the featured band, filters, and filterable cards", () => {
  const html = pages["/portfolio/projects/"];
  assert.match(html, /class="rd-featured"[\s\S]*?href="\/portfolio\/projects\/auralogbook\/"/);
  assert.match(html, /data-project-filters hidden/);
  for (const value of ["all", "fullstack", "integration", "automation", "systems"]) {
    assert.match(html, new RegExp(`aria-pressed="(?:true|false)" data-filter-value="${value}"`));
  }
  assert.match(html, /data-filter-status aria-live="polite"/);
  const filters = [...html.matchAll(/<article class="project rd-post" data-filter="([a-z]+)">/g)].map(([, value]) => value);
  assert.equal(filters.length, 6);
  assert.deepEqual([...new Set(filters)].sort(), ["automation", "fullstack", "integration", "systems"]);
  assert.match(catalog, /focus: ProjectFocus;/);
});

test("case study leads with a pausable story carousel and keeps its evidence", () => {
  const html = pages["/portfolio/projects/auralogbook/"];
  assert.match(html, /<section class="rd-hero">[\s\S]*?<h1>Aura Logbook<\/h1>[\s\S]*?data-story aria-roledescription="carousel"/);
  assert.equal((html.match(/data-story-slide /g) ?? []).length, 4);
  assert.match(html, /data-story-toggle hidden>Pause<\/button>/);
  assert.match(html, /class="rd-stats"/);
  for (const id of ["problem", "implementation", "architecture", "screens", "journey", "evidence"]) {
    assert.match(html, new RegExp(`<section id="${id}"`), `missing case-study section ${id}`);
  }
  assert.match(html, /id="aura-image-dialog"/);
  assert.match(html, /data-project-gallery="auralogbook"/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /addEventListener\("focusin"/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
