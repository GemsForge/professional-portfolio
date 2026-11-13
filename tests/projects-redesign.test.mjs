import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/**
 * Guards the #131 site redesign: every page except the social-profile home
 * receives the shared top bar and opt-in `rd` layer, the home page stays
 * untouched, and the progressive enhancements keep their accessible hooks.
 */
const pages = JSON.parse(await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"));
const css = await readFile(new URL("../static-source/assets/redesign.css", import.meta.url), "utf8");
const script = await readFile(new URL("../static-source/assets/projects-redesign.js", import.meta.url), "utf8");
const catalog = await readFile(new URL("../scripts/project-catalog.mts", import.meta.url), "utf8");
const { applySiteRedesign, renderTopBar, PROFILE_ROUTES } = await import("../scripts/site-redesign.mjs");
const REDESIGNED = Object.keys(pages).filter((route) => !PROFILE_ROUTES.has(route));

test("every non-profile page gets the redesign shell exactly once", () => {
  assert.ok(REDESIGNED.length >= 15, "expected the full public page set");
  for (const route of REDESIGNED) {
    const html = pages[route];
    assert.match(html, /<body class="[^"]*\brd\b[^"]*">/, `${route} should opt in`);
    assert.equal((html.match(/href="\/assets\/redesign\.css"/g) ?? []).length, 1, `${route} stylesheet count`);
    assert.equal((html.match(/src="\/assets\/projects-redesign\.js"/g) ?? []).length, 1, `${route} script count`);
    assert.equal((html.match(/class="rd-topbar"/g) ?? []).length, 1, `${route} top bar count`);
    assert.doesNotMatch(html, /<div class="wrap nav">/, `${route} still has the old header`);
  }
  for (const route of PROFILE_ROUTES) {
    assert.doesNotMatch(pages[route], /redesign\.css|class="rd-topbar"|<body class="rd/, `${route} must keep the profile design`);
  }
  // Every rule is scoped to the opt-in body class or an rd- component class.
  assert.match(css, /^body\.rd\{/m);
  assert.doesNotMatch(css, /^(?:header|main|footer|h1|h2|h3|a|body)\s*\{/m);
});

test("the shared top bar marks the active section for each route", () => {
  assert.match(renderTopBar("/portfolio/projects/hair-log/"), /<a href="\/portfolio\/projects\/" aria-current="page">Projects<\/a>/);
  assert.match(renderTopBar("/about/"), /<a href="\/about\/" aria-current="page">About<\/a>/);
  assert.match(renderTopBar("/contacts/"), /<a href="\/contact\/" aria-current="page">Contact<\/a>/);
  assert.doesNotMatch(renderTopBar("/work/"), /aria-current/);
  assert.match(renderTopBar("/"), /class="rd-handle" href="\/"[\s\S]*?profile-avatar-320\.jpg/);
});

test("applying the shell is idempotent and leaves profile routes alone", () => {
  const source = '<html><head><link rel="stylesheet" href="/assets/site.css"></head><body class="x"><header><div class="wrap nav">old</div></header><main></main></body></html>';
  const once = applySiteRedesign(source, "/about/");
  assert.equal(applySiteRedesign(once, "/about/"), once);
  assert.match(once, /<body class="x rd">/);
  assert.equal(applySiteRedesign(source, "/"), source);
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

test("the ADP career page leads with onboarding and accessibility impact", () => {
  const html = pages["/work/enterprise-applications/"];
  assert.match(html, /<section class="rd-impact" aria-label="Impact at ADP">[\s\S]*?2 weeks → 3 days[\s\S]*?As a new developer[\s\S]*?Led WCAG refactor[\s\S]*?toward WCAG standards/);
  assert.match(html, /What accessibility taught me/);
  assert.match(html, /onboarding figure is self-reported/);
});
