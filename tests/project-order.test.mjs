import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/** Code-backed projects lead so recruiters see full-stack and API work first. */
const HOME_ORDER = ["auralogbook", "notion-api-shortcuts", "75-hard-automation"];
const CATALOG_ORDER = [
  ...HOME_ORDER,
  "hair-log",
  "dynamic-folder-structures",
  "apple-ecosystem",
];

/** Lists project card slugs in the order the cards appear in a page. */
const cardSlugs = (html) =>
  [...html.matchAll(/<article class="project"><a href="\/portfolio\/projects\/([a-z0-9-]+)\//g)].map(
    ([, slug]) => slug,
  );

const pages = JSON.parse(
  await readFile(new URL("../lib/static-pages.json", import.meta.url), "utf8"),
);

test("home page features code-backed projects in priority order", () => {
  assert.deepEqual(cardSlugs(pages["/"]), HOME_ORDER);
});

test("projects page lists the full catalog from most to least code-heavy", () => {
  assert.deepEqual(cardSlugs(pages["/portfolio/projects/"]), CATALOG_ORDER);
});
