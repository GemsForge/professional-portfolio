import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { PORTFOLIO_POSTS } from "../scripts/project-catalog.mts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const generated = new URL("../lib/static-pages.json", import.meta.url);

/** The generator is the source of truth for the browser-ready portfolio markup. */
async function readGeneratedHome() {
  const result = spawnSync(process.execPath, ["scripts/prepare-pages.mjs"], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const pages = JSON.parse(await readFile(generated, "utf8"));
  return pages["/"];
}

test("creator catalog opens with the agreed nine-post social grid order", async () => {
  const html = await readGeneratedHome();
  const slugs = PORTFOLIO_POSTS.map(({ slug }) => slug);
  assert.deepEqual(slugs.slice(0, 4), ["auralogbook", "notion-api-shortcuts", "portfolio-direction", "tech-stack"]);
  assert.equal(PORTFOLIO_POSTS.length, 9);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "project").length, 6);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "process").length, 2);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "tech-stack").length, 1);
  const tileOrder = [...html.matchAll(/class="creator-post-tile tile-[^"]+" href="[^"]+" data-post-link="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tileOrder, slugs);
  assert.equal((html.match(/data-post-view="[^"]+"/g) ?? []).length, 9);
  assert.ok(html.indexOf('class="profile-header"') < html.indexOf('class="creator-main-column"'), "the profile header should sit above the feed");
  assert.match(html, /I build apps, organize the work behind them, and shape how people use them\./);
  assert.doesNotMatch(html, /A developer’s precision|practical point of view|FIELD NOTE/);
  assert.match(html, /data-filter="all" aria-pressed="true">All <span>09<\/span>/);
  assert.match(html, /data-filter="project" aria-pressed="false">Projects <span>06<\/span>/);
  assert.match(html, /data-filter="process" aria-pressed="false">Process <span>02<\/span>/);
  assert.match(html, /data-filter="tech-stack" aria-pressed="false">Tech Stack <span>01<\/span>/);
});

test("project posts identify evidence and provide guided prototype steps", () => {
  const projects = PORTFOLIO_POSTS.filter(({ category }) => category === "project");
  assert.equal(projects.length, 6);
  for (const post of projects) {
    assert.ok(post.caseStudy, `${post.slug} should retain its full case-study route`);
    assert.ok(post.evidence.length > 30, `${post.slug} should explain evidence or current status`);
    assert.equal(post.walkthrough?.length, 3, `${post.slug} should have three guided steps`);
    assert.ok(post.walkthrough.every(({ hotspot }) => hotspot.label), `${post.slug} should label every hotspot`);
  }
});

test("generated post viewer retains project routes, source links, and the one-page controls", async () => {
  const html = await readGeneratedHome();
  const script = await read("../static-source/assets/creator-profile.js");
  const css = await read("../static-source/assets/site.css");
  assert.match(html, /id="creator-post-grid" class="creator-post-grid"/);
  assert.match(html, /id="post-dialog" class="post-dialog"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /href="\/portfolio\/projects\/auralogbook\/"[^>]*>Read the full case study/);
  assert.match(html, /href="https:\/\/github\.com\/GemsForge\/aura-logbook-api"/);
  assert.match(html, /href="\/admin\/">Admin<\/a>/);
  assert.match(html, /href="\/knowledge\/">Dev Wiki<\/a>/);
  assert.match(script, /history\.pushState/);
  assert.match(script, /window\.addEventListener\("popstate"/);
  assert.match(script, /window\.addEventListener\("hashchange"/);
  assert.match(script, /portfolioScroll/);
  assert.match(script, /opener\.focus/);
  assert.match(css, /\.creator-post-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:650px\)\{[\s\S]*?\.creator-post-grid\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test("technology groups link to project evidence and mark undeployed SQL accurately", () => {
  const stack = PORTFOLIO_POSTS.find(({ slug }) => slug === "tech-stack");
  assert.ok(stack?.stackGroups?.length);
  const evidenceLinks = stack.stackGroups.flatMap(({ items }) => items);
  assert.ok(evidenceLinks.some(({ label, postSlug }) => label === "React" && postSlug === "auralogbook"));
  assert.ok(evidenceLinks.some(({ label }) => label === "SQL (declared dependency)"));
  assert.ok(evidenceLinks.some(({ label, href }) => label === "Java / Spring Boot training" && href === "/about/"));
});
