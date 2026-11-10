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

test("creator grid features six project stories and keeps the technology shortcut separate", async () => {
  const html = await readGeneratedHome();
  const slugs = PORTFOLIO_POSTS.map(({ slug }) => slug);
  assert.deepEqual(slugs.slice(0, 4), ["auralogbook", "notion-api-shortcuts", "portfolio-direction", "tech-stack"]);
  assert.equal(PORTFOLIO_POSTS.length, 8);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "project").length, 6);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "process").length, 1);
  assert.equal(PORTFOLIO_POSTS.filter(({ category }) => category === "tech-stack").length, 1);
  const tileOrder = [...html.matchAll(/class="creator-post-tile tile-[^"]+" href="[^"]+" data-post-link="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tileOrder, slugs.filter((slug) => !["tech-stack", "portfolio-direction"].includes(slug)));
  assert.equal(tileOrder.length, 6);
  assert.doesNotMatch(html, /data-post-link="portfolio-direction"/);
  assert.equal((html.match(/data-post-view="[^"]+"/g) ?? []).length, 8);
  assert.match(html, /data-post-view="portfolio-direction"/, "the direction story remains available to in-modal navigation");
  assert.doesNotMatch(html, /<div class="post-story-topline"><span>[^<]*<\/span><span>\d{2} \/ \d{2}<\/span><\/div>/, "no post position counter should appear in any modal header");
  assert.doesNotMatch(html, /walkthrough-counter|data-step-counter|\d{2} \/ \d{2}/, "modals should not show post or walkthrough progress counts");
  assert.match(html, /<nav class="creator-mobile-nav" aria-label="Mobile navigation">/);
  assert.match(html, /<a href="#feed" aria-label="Work">/);
  assert.match(html, /<a href="#about" aria-label="About">/);
  assert.match(html, /<a href="\/assets\/diamond-brown-resume\.pdf" aria-label="Résumé">/);
  assert.match(html, /<a href="#contact" aria-label="Contact">/);
  assert.doesNotMatch(html, /Make the work legible|project-management/);
  assert.ok(html.indexOf('class="profile-header"') < html.indexOf('class="creator-main-column"'), "the profile header should sit above the feed");
  assert.match(html, /class="profile-summary"/);
  assert.doesNotMatch(html, /class="profile-stats"|<strong>09<\/strong> posts/);
  assert.doesNotMatch(html, /tile-social-cues/);
  const profile = html.slice(html.indexOf('<section class="profile-header"'), html.indexOf('<div class="creator-main-column">'));
  const profileName = profile.indexOf('<h1 id="creator-name">Diamond Brown</h1>');
  const profileRole = profile.indexOf('class="profile-kicker">Full-stack developer</p>');
  const profileLocation = profile.indexOf('class="profile-location"><svg');
  const profileBio = profile.indexOf('class="profile-bio">I build apps, organize the work behind them, and shape how people use them. Interested in application development, systems analysis, QA automation, or technical enablement? Tell me what your team is working on.</p>');
  const profileActions = profile.indexOf('class="profile-links profile-actions"');
  assert.ok(profileName >= 0 && profileName < profileRole && profileRole < profileLocation && profileLocation < profileBio && profileBio < profileActions, "profile details should follow the requested hierarchy");
  assert.match(profile.slice(profileActions), /profile-button-icon/);
  assert.doesNotMatch(profile.slice(profileActions, profile.indexOf("</div>", profileActions)), /↗|→/);
  assert.doesNotMatch(profile, /SOFTWARE\s*[·.]\s*SYSTEMS\s*[·.]\s*DIRECTION/i);
  assert.doesNotMatch(html, /Software\s*[·.]\s*Systems\s*[·.]\s*Direction/i);
  assert.match(html, /I build apps, organize the work behind them, and shape how people use them\./);
  assert.doesNotMatch(html, /A developer’s precision|practical point of view|FIELD NOTE/);
  assert.doesNotMatch(html, /class="feed-filter"|data-filter=/, "the project-only grid should not show filter controls");
  const techStrip = html.slice(html.indexOf('class="profile-tech-strip"'), html.indexOf("</nav>", html.indexOf('class="profile-tech-strip"')));
  assert.doesNotMatch(techStrip, /data-post-link=/, "technology highlights should link to their official websites rather than the Tech Stack post");
  for (const [label, href] of [
    ["C#", "https://dotnet.microsoft.com/languages/csharp"],
    [".NET", "https://dotnet.microsoft.com/"],
    ["React", "https://react.dev/"],
    ["TypeScript", "https://www.typescriptlang.org/"],
    ["Redux", "https://redux.js.org/"],
    ["PostgreSQL", "https://www.postgresql.org/"],
    ["Java", "https://www.java.com/"],
    ["Notion", "https://www.notion.so/"],
  ]) {
    assert.match(techStrip, new RegExp(`<a href="${href.replaceAll("/", "\\/")}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${label.replace("#", "\\#")} official website`));
  }
  assert.equal((techStrip.match(/class="profile-tech-mark"/g) ?? []).length, 8);
  for (const technology of ["C#", ".NET", "React", "TypeScript", "Redux", "PostgreSQL", "Java", "Notion"]) {
    assert.ok(techStrip.includes(technology), `${technology} should appear in the technology strip`);
  }
  assert.doesNotMatch(html, /PROJECTS &amp; PROCESS|Selected work|01—09|App development, project planning, and design decisions from work I’ve built/);
  assert.match(html, /id="post-stories">[\s\S]*?data-post-view="auralogbook"/);
});

test("creator profile uses a centered maximum canvas that stays fluid on smaller viewports", async () => {
  const css = await read("../static-source/assets/site.css");
  assert.match(css, /\.creator-shell\{width:min\(100%,1120px\);margin-inline:auto\}/);
  assert.match(css, /\.profile-header,\.creator-main-column\{width:min\(100%,980px\);margin-inline:auto\}/);
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
  const stackPost = html.slice(html.indexOf('data-post-view="tech-stack"'), html.indexOf('</article>', html.indexOf('data-post-view="tech-stack"')));
  assert.match(stackPost, /The tools I’ve worked with professionally and in personal projects over the past four years/);
  assert.match(stackPost, /<section class="post-tools stack-profile"><section class="stack-groups"/);
  assert.match(stackPost, /<a class="tech-chip" href="#post\/auralogbook"/);
  assert.match(stackPost, /<img src="\/assets\/auralogbook-stack\/sqlite\.png" alt=""/);
  assert.doesNotMatch(stackPost, /post-facts|post-decisions|Illustrative prototype|class="post-tool-list"/, "the Tech Stack story should read as a profile, not a project case study");
  assert.match(script, /history\.pushState/);
  assert.match(script, /window\.addEventListener\("popstate"/);
  assert.match(script, /window\.addEventListener\("hashchange"/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /creator-nav-visible/);
  assert.doesNotMatch(script, /applyFilter|portfolioFilter|data-filter/, "the post client should not keep stale filter behavior or URL state");
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
  assert.match(css, /\.post-story>\.post-tools,\.post-story>\.post-decisions\{margin:0;padding:0;border:0\}/);
  assert.match(css, /\.tech-chip img\{width:15px;height:15px;flex:none;object-fit:contain\}/);
  assert.match(css, /\.post-close\{width:32px;height:32px;font-size:20px\}/);
  assert.match(css, /@media\(min-width:651px\)\{\.post-view-story\{overflow:auto\}\}/);
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
