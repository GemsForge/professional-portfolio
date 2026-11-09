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

test("creator catalog keeps eight posts in the grid and a separate technology shortcut", async () => {
  const html = await readGeneratedHome();
  const slugs = PORTFOLIO_POSTS.map(({ slug }) => slug);
  assert.deepEqual(slugs.slice(0, 4), ["auralogbook", "notion-api-shortcuts", "portfolio-direction", "tech-stack"]);
  assert.equal(PORTFOLIO_POSTS.length, 9);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "project").length, 6);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "process").length, 2);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "tech-stack").length, 1);
  const tileOrder = [...html.matchAll(/class="creator-post-tile tile-[^"]+" href="[^"]+" data-post-link="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tileOrder, slugs.filter((slug) => slug !== "tech-stack"));
  assert.equal(tileOrder.length, 8);
  assert.equal((html.match(/data-post-view="[^"]+"/g) ?? []).length, 9);
  assert.ok(html.indexOf('class="profile-header"') < html.indexOf('class="creator-main-column"'), "the profile header should sit above the feed");
  assert.match(html, /class="profile-summary"/);
  assert.doesNotMatch(html, /class="profile-stats"|<strong>09<\/strong> posts/);
  assert.doesNotMatch(html, /tile-social-cues/);
  const profile = html.slice(html.indexOf('<section class="profile-header"'), html.indexOf('<div class="creator-main-column">'));
  const profileName = profile.indexOf('<h1 id="creator-name">Diamond Brown</h1>');
  const profileRole = profile.indexOf('class="profile-kicker">Full-stack developer</p>');
  const profileLocation = profile.indexOf('class="profile-location"><svg');
  const profileBio = profile.indexOf('class="profile-bio">I build apps, organize the work behind them, and shape how people use them.</p>');
  const profileActions = profile.indexOf('class="profile-links profile-actions"');
  assert.ok(profileName >= 0 && profileName < profileRole && profileRole < profileLocation && profileLocation < profileBio && profileBio < profileActions, "profile details should follow the requested hierarchy");
  assert.match(profile.slice(profileActions), /profile-button-icon/);
  assert.doesNotMatch(profile.slice(profileActions, profile.indexOf("</div>", profileActions)), /↗|→/);
  assert.doesNotMatch(profile, /SOFTWARE\s*[·.]\s*SYSTEMS\s*[·.]\s*DIRECTION/i);
  assert.doesNotMatch(html, /Software\s*[·.]\s*Systems\s*[·.]\s*Direction/i);
  assert.match(html, /I build apps, organize the work behind them, and shape how people use them\./);
  assert.doesNotMatch(html, /A developer’s precision|practical point of view|FIELD NOTE/);
  assert.match(html, /data-filter="all" aria-pressed="true">All <span>08<\/span>/);
  assert.match(html, /data-filter="project" aria-pressed="false">Projects <span>06<\/span>/);
  assert.match(html, /data-filter="process" aria-pressed="false">Process <span>02<\/span>/);
  assert.doesNotMatch(html, /data-filter="tech-stack"/);
  const techStrip = html.slice(html.indexOf('class="profile-tech-strip"'), html.indexOf("</nav>", html.indexOf('class="profile-tech-strip"')));
  assert.equal((techStrip.match(/data-post-link="tech-stack"/g) ?? []).length, 8);
  assert.equal((techStrip.match(/class="profile-tech-mark"/g) ?? []).length, 8);
  for (const technology of ["C#", ".NET", "React", "TypeScript", "Redux", "PostgreSQL", "Java", "Notion"]) {
    assert.ok(techStrip.includes(technology), `${technology} should appear in the technology strip`);
  }
  assert.doesNotMatch(html, /PROJECTS &amp; PROCESS|Selected work|01—09|App development, project planning, and design decisions from work I’ve built/);
  assert.match(html, /id="post-stories">[\s\S]*?data-post-view="auralogbook"/);
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
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /creator-nav-visible/);
  assert.match(script, /button\.addEventListener\("click", \(\) => applyFilter\(button\.dataset\.filter\)\)/);
  assert.match(script, /portfolioScroll/);
  assert.match(script, /opener\.focus/);
  assert.match(css, /\.creator-post-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /--font:'Avenir Next',Avenir/);
  assert.match(css, /\.creator-page\{font-family:var\(--font\)\}/);
  assert.match(css, /\.profile-intro h1\{margin:0;font:500 28px\/1\.2 var\(--font\)/);
  assert.match(css, /\.profile-intro \.profile-kicker\{[^}]*font-family:var\(--font\)/);
  assert.match(css, /\.profile-intro \.profile-bio\{[^}]*font:14px\/1\.5 var\(--font\)/);
  assert.doesNotMatch(css, /\.creator-page[^}]*font-family:Arial/);
  assert.match(css, /\.creator-nav-ready\.creator-nav-visible \.creator-topbar/);
  assert.match(css, /\.creator-shell\{margin-top:0\}/);
  assert.match(css, /\.profile-header\{margin-top:0\}/);
  assert.match(css, /\.profile-tech-strip ul\{display:flex;flex-wrap:nowrap;[^}]*overflow-x:auto/);
  assert.match(css, /\.profile-tech-mark\{display:grid;width:44px;height:44px/);
  assert.match(css, /\.profile-tech-strip img,\.profile-tech-strip svg\{display:block;width:30px;height:30px/);
  assert.match(css, /\.profile-tech-strip a:hover \.profile-tech-mark[^}]*transform:translateY\(-3px\) scale\(1\.08\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.profile-tech-mark\{transition:none\}/);
  assert.match(css, /\.creator-post-grid\{gap:3px\}/);
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
