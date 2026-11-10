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

/** Direction D (issue #108): the social-profile header, highlights, and mixed 3 × 3 grid. */
test("social profile shows the résumé-backed header, experience highlights, and a nine-tile grid", async () => {
  const html = await readGeneratedHome();
  const slugs = PORTFOLIO_POSTS.map(({ slug }) => slug);
  assert.deepEqual(slugs.slice(0, 4), ["auralogbook", "notion-api-shortcuts", "portfolio-direction", "tech-stack"]);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "project").length, 6);

  const profile = html.slice(html.indexOf('<section class="sp-profile"'), html.indexOf('<section id="highlights"'));
  assert.match(profile, /<h1 id="creator-name">Diamond Brown<\/h1>/);
  assert.match(profile, /<a class="sp-button sp-button-primary" href="mailto:diamondbrown\.tech@gmail\.com">Contact<\/a>/);
  assert.match(profile, /<a class="sp-button" href="\/assets\/diamond-brown-resume\.pdf">Résumé<\/a>/);
  assert.match(profile, /<li><strong>6<\/strong> projects<\/li>\s*<li><strong>4<\/strong> roles<\/li>\s*<li><strong>13<\/strong> yrs Army Guard<\/li>/);
  assert.doesNotMatch(html, /followers|likes|following/i, "stats must be résumé counts, not social engagement");
  for (const line of ["Software Engineer Analyst @ ADP", "U.S. Secret clearance · Army National Guard Staff Sergeant", "Cut dev onboarding from two weeks to three days.", "Atlanta · open to remote or hybrid"]) {
    assert.ok(profile.includes(line), `bio should include: ${line}`);
  }
  assert.match(profile, /href="https:\/\/github\.com\/GemsForge"/);
  assert.match(profile, /href="https:\/\/www\.linkedin\.com\/in\/diamond-brown\/"/);

  const highlights = [...html.matchAll(/<a href="([^"]+)" data-highlight-link="([a-z]+)"><span class="sp-highlight-ring/g)].map((match) => [match[2], match[1]]);
  assert.deepEqual(highlights, [["adp", "/work/enterprise-applications/"], ["army", "/about/"], ["gemsforge", "/work/gemsforge-business-systems/"], ["apprentice", "/assets/diamond-brown-resume.pdf"]], "each highlight is a working link before JavaScript upgrades it");
  const views = [...html.matchAll(/data-highlight-view="([a-z]+)"/g)].map((match) => match[1]);
  assert.deepEqual(views, ["adp", "army", "gemsforge", "apprentice"]);
  assert.match(html, /February 2023 – present[\s\S]*?2 weeks → 3 days/);
  assert.match(html, /May 2013 – present[\s\S]*?Staff Sergeant and Squad Leader/);
  assert.equal((html.match(/data-close-highlight aria-label="Close highlight"/g) ?? []).length, 4);

  const grid = html.slice(html.indexOf('id="creator-post-grid"'), html.indexOf("</section>", html.indexOf('id="creator-post-grid"')));
  const tiles = [...grid.matchAll(/<a class="(creator-post-tile tile-[a-z0-9-]+|sp-feature-tile sp-tile-[a-z]+)"/g)].map((match) => match[1].split(" ")[1]);
  assert.deepEqual(tiles, ["tile-auralogbook", "sp-tile-quote", "tile-notion-api-shortcuts", "tile-75-hard-automation", "sp-tile-diagram", "sp-tile-text", "tile-hair-log", "tile-dynamic-folder-structures", "tile-apple-ecosystem"]);
  const tileOrder = [...grid.matchAll(/class="creator-post-tile tile-[^"]+" href="[^"]+" data-post-link="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tileOrder, slugs.filter((slug) => !["tech-stack", "portfolio-direction"].includes(slug)));
  assert.equal((grid.match(/class="sp-tile-bar"/g) ?? []).length, 6, "every project tile has a title bar");
  assert.match(grid, /aria-label="Open post: Pinned\. Aura Logbook\./);
  assert.match(grid, /<span>POST \/v1\/pages<\/span><span class="sp-wide">Simplified<\/span>/);
  assert.match(grid, /src="\/assets\/75-days-shortcuts-overview\.png"/);

  const viewOrder = [...html.matchAll(/data-post-view="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(viewOrder, tileOrder, "Next/Previous cycles through post views, so they must match the project tiles exactly");
  assert.doesNotMatch(html, /\d{2} \/ \d{2}/, "modals should not show post or walkthrough counts");

  const main = html.slice(html.indexOf('<main id="main"'), html.indexOf("</main>"));
  assert.doesNotMatch(main, /href="https:\/\/(?:react\.dev|redux\.js\.org|www\.typescriptlang\.org|dotnet\.microsoft\.com|www\.postgresql\.org|www\.java\.com|www\.notion\.so)/, "nothing on the profile links to a technology vendor");
  assert.match(html, /<nav class="creator-mobile-nav" aria-label="Mobile navigation">/);
  for (const [href, label] of [["#posts", "Posts"], ["#highlights", "Experience"], ["\/assets\/diamond-brown-resume\.pdf", "Résumé"], ["#contact", "Contact"]]) {
    assert.match(html, new RegExp(`<a href="${href}" aria-label="${label}">`));
  }
});

test("the /portfolio/ alias renders the same social profile as the homepage", async () => {
  await readGeneratedHome();
  const pages = JSON.parse(await readFile(generated, "utf8"));
  const grid = (html) => html.slice(html.indexOf('id="creator-post-grid"'), html.indexOf("</section>", html.indexOf('id="creator-post-grid"')));
  assert.equal(grid(pages["/portfolio/"]), grid(pages["/"]));
  assert.match(pages["/portfolio/"], /id="highlight-dialog"/);
});

test("social profile uses a 935px centered column", async () => {
  const css = await read("../static-source/assets/site.css");
  assert.match(css, /\.sp-main\{max-width:935px;margin:0 auto/);
});

test("project posts identify evidence and provide guided prototype steps", () => {
  const projects = PORTFOLIO_POSTS.filter(({ category }) => category === "project");
  assert.equal(projects.length, 6);
  for (const post of projects) {
    assert.ok(post.caseStudy, `${post.slug} should retain its full case-study route`);
    assert.ok(post.evidence.length > 30, `${post.slug} should explain evidence or current status`);
    assert.equal(post.walkthrough?.length, post.slug === "auralogbook" ? 5 : 3, `${post.slug} should have the expected number of guided steps`);
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
  const auraPost = html.slice(html.indexOf('data-post-view="auralogbook"'), html.indexOf('</article>', html.indexOf('data-post-view="auralogbook"')));
  assert.ok(auraPost.indexOf('<dl class="post-facts">') < auraPost.indexOf('<section class="post-tools"><h3>Tech</h3>') && auraPost.indexOf('<section class="post-tools"><h3>Tech</h3>') < auraPost.indexOf('data-mobile-visual') && auraPost.indexOf('data-mobile-visual') < auraPost.indexOf('<section class="walkthrough"') && auraPost.indexOf('<section class="walkthrough"') < auraPost.indexOf('<section class="post-decisions">'), "Tech, the mobile visual, and the prototype should follow the role and evidence table in order");
  assert.match(auraPost, /<img src="\/assets\/aura-logbook\.png" alt="Open reflection journal with mood markers"/);
  assert.match(auraPost, /class="tech-chip"/);
  assert.match(auraPost, /\/assets\/auralogbook-stack\/react\.png/);
  assert.match(auraPost, /\/assets\/auralogbook-stack\/dapper\.png/);
  assert.match(auraPost, /\/assets\/auralogbook-stack\/jwt-bearer\.png/);
  assert.doesNotMatch(auraPost, /<figcaption>/, "post artwork should not have a visible caption below it");
  assert.match(auraPost, /typed forms and RTK Query to JWT-protected endpoints and repository-backed services/);
  assert.match(auraPost, /<dt>Where it stands<\/dt>/);
  assert.match(auraPost, /<h3>Technical choices<\/h3>/);
  assert.match(auraPost, /<h3 id="walkthrough-auralogbook">Walkthrough<\/h3>/);
  assert.match(auraPost, /A save writes the entry and its mood rows in one transaction/);
  assert.match(auraPost, /Spotify uses OAuth with PKCE/);
  assert.match(auraPost, /Photo files stay out of public assets/);
  assert.match(auraPost, /Spotify tracks are not saved to mood entries/);
  assert.match(script, /history\.pushState/);
  assert.match(script, /window\.addEventListener\("popstate"/);
  assert.match(script, /window\.addEventListener\("hashchange"/);
  assert.doesNotMatch(script, /applyFilter|portfolioFilter|data-filter/, "the post client should not keep stale filter behavior or URL state");
  assert.match(script, /portfolioScroll/);
  assert.match(script, /opener\.focus/);
  assert.match(css, /\.post-story>\.post-tools,\.post-story>\.post-decisions\{margin:0;padding:0;border:0\}/);
  assert.match(css, /\.tech-chip img\{width:15px;height:15px;flex:none;object-fit:contain\}/);
  assert.match(css, /\.post-close\{width:32px;height:32px;font-size:20px\}/);
  assert.match(css, /@media\(min-width:651px\)\{\.post-view-story\{overflow:auto\}\}/);
});

test("Tech Stack summarizes professional and personal tools with relevant project links", () => {
  const stack = PORTFOLIO_POSTS.find(({ slug }) => slug === "tech-stack");
  assert.ok(stack?.stackGroups?.length);
  const evidenceLinks = stack.stackGroups.flatMap(({ items }) => items);
  assert.ok(evidenceLinks.some(({ label, postSlug }) => label === "React" && postSlug === "auralogbook"));
  assert.ok(evidenceLinks.some(({ label }) => label === "PostgreSQL"));
  assert.ok(evidenceLinks.some(({ label, postSlug }) => label === "SQLite" && postSlug === "auralogbook"));
  assert.ok(evidenceLinks.some(({ label }) => label === "Java"));
  assert.ok(evidenceLinks.some(({ label, postSlug }) => label === "Notion" && postSlug === "notion-api-shortcuts"));
});

test("highlight stories return focus and wrap from the last story to the first", async () => {
  const script = await read("../static-source/assets/creator-profile.js");
  assert.match(script, /function setUpHighlights\(\)/);
  assert.match(script, /\(current \+ 1\) % stories\.length/);
  assert.match(script, /dialog\.addEventListener\("close"[\s\S]*?opener\.focus/);
});

test("phones get a compact header, five fitting highlights, and short tile text", async () => {
  const html = await readGeneratedHome();
  const css = await read("../static-source/assets/site.css");
  // The photo sits beside the name and stats on phones instead of above them.
  assert.match(css, /\.sp-profile\{display:grid;grid-template-columns:auto minmax\(0,1fr\)/);
  assert.match(css, /\.sp-profile-body,\.sp-name-row\{display:contents\}/);
  // Every feature tile and the Notion code tile carry a phone-length version of their text.
  for (const short of ["ADP onboarding", "2 weeks <span aria-hidden=\"true\">→</span> 3 days", "Check-in flow", "SSG since 2013"]) {
    assert.ok(html.includes(`<span class="sp-narrow">${short}</span>`), `missing phone text: ${short}`);
  }
  assert.match(html, /<span class="sp-narrow">\{\n  "parent": \{…\},\n  "properties": \{…\}\n\}<\/span>/);
  assert.match(css, /\.sp-narrow\{display:none\}/);
  assert.match(css, /@media\(max-width:650px\)\{[\s\S]*?\.sp-wide\{display:none\}[\s\S]*?\.sp-narrow\{display:inline\}/);
});
