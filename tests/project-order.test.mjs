import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/** Code-backed projects lead so recruiters see full-stack and API work first. */
const LEAD_PROJECTS = ["auralogbook", "notion-api-shortcuts"];
const CATALOG_ORDER = [
  ...LEAD_PROJECTS,
  "75-hard-automation",
  "hair-log",
  "dynamic-folder-structures",
  "apple-ecosystem",
];

/**
 * Lists project card slugs in the order the cards appear in a page. Cards may
 * carry extra classes and data attributes (the #131 post-style card adds
 * `rd-post` and `data-filter`), so only the leading class and link are pinned.
 */
const cardSlugs = (html) =>
  [...html.matchAll(/<article class="project[^"]*"[^>]*><a href="\/portfolio\/projects\/([a-z0-9-]+)\//g)].map(
    ([, slug]) => slug,
  );

const pages = JSON.parse(
  await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"),
);

/** Lists profile-grid tile slugs in display order. */
const gridSlugs = (html) =>
  [...html.matchAll(/<a class="creator-post-tile tile-([a-z0-9-]+)"/g)].map(([, slug]) => slug);

test("home profile grid matches the Projects page order", () => {
  assert.deepEqual(gridSlugs(pages["/"]), CATALOG_ORDER);
});

test("projects page lists the full catalog from most to least code-heavy", () => {
  assert.deepEqual(cardSlugs(pages["/portfolio/projects/"]), CATALOG_ORDER);
});
