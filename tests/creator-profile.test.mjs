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
  // Contact and Résumé live in the highlights row (#131), so the header has no duplicate buttons.
  assert.doesNotMatch(profile, /class="sp-button/);
  const highlightRow = html.slice(html.indexOf('<section id="highlights"'), html.indexOf('<nav class="sp-sections"'));
  assert.match(highlightRow, /<li id="contact"><a href="mailto:diamondbrown\.tech@gmail\.com" aria-label="Contact Diamond by email">/);
  assert.doesNotMatch(highlightRow, /mailto:[^"]*" data-highlight-link/, "Contact must stay a plain mailto link, not a story card");
  assert.match(highlightRow, /href="\/assets\/diamond-brown-resume\.pdf"><span class="sp-highlight-ring[^"]*">[\s\S]*?Résumé/);
  // Army service stays in the bio and the Army Guard highlight, so the stats row shows only portfolio and role counts.
  assert.match(profile, /<li><strong>6<\/strong> projects<\/li>\s*<li><strong>4<\/strong> roles<\/li>\s*<\/ul>/);
  assert.doesNotMatch(profile, /yrs Army Guard/);
  assert.doesNotMatch(html, /followers|likes|following/i, "stats must be résumé counts, not social engagement");
  for (const line of ["Software Engineer Analyst @ ADP", "U.S. Secret clearance · Army National Guard since 2013", "Cut dev onboarding from two weeks to three days.", "Atlanta · open to remote or hybrid"]) {
    assert.ok(profile.includes(line), `bio should include: ${line}`);
  }
  assert.match(profile, /href="https:\/\/github\.com\/GemsForge"/);
  assert.match(profile, /href="https:\/\/www\.linkedin\.com\/in\/diamond-brown\/"/);

  const highlights = [...html.matchAll(/<a href="([^"]+)" data-highlight-link="([a-z]+)"><span class="sp-highlight-ring/g)].map((match) => [match[2], match[1]]);
  assert.deepEqual(highlights, [["adp", "/work/enterprise-applications/"], ["gemsforge", "/work/gemsforge-business-systems/"], ["apprentice", "/assets/diamond-brown-resume.pdf"], ["army", "/about/"]], "the Army Guard highlight remains last in the reel");
  const views = [...html.matchAll(/data-highlight-view="([a-z]+)"/g)].map((match) => match[1]);
  assert.deepEqual(views, ["adp", "gemsforge", "apprentice", "army"]);
  assert.match(html, /February 2023 – present[\s\S]*?2 weeks → 3 days/);
  // The ADP story leads with both résumé-backed wins: onboarding as a new developer and the WCAG refactor (#131).
  const adpStory = html.slice(html.indexOf('data-highlight-view="adp"'), html.indexOf('data-highlight-view="gemsforge"'));
  assert.match(adpStory, /class="sp-story-metrics"[\s\S]*?2 weeks → 3 days[\s\S]*?as a new developer[\s\S]*?Led WCAG refactor[\s\S]*?toward WCAG/);
  assert.match(adpStory, /semantic HTML, C#, and UI development process/);
  assert.match(html, /<p>Led a frontend accessibility refactor toward WCAG\.<\/p>/);
  assert.match(html, /Since May 2013[\s\S]*?Army National Guard service since 2013/);
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
    assert.equal(post.walkthrough?.length, post.slug === "auralogbook" ? 10 : 3, `${post.slug} should have the expected number of guided steps`);
    if (post.slug === "auralogbook") {
      assert.ok(post.walkthrough.every(({ hotspot, screenshot }) => !hotspot && !screenshot?.hotspot), "Aura Logbook's app tour does not add unused plus markers");
    } else {
      assert.ok(post.walkthrough.every(({ hotspot }) => hotspot.label), `${post.slug} should label every hotspot`);
    }
  }
});

test("generated post viewer retains project routes, source links, and the one-page controls", async () => {
  const html = await readGeneratedHome();
  const script = await read("../static-source/assets/creator-profile.js");
  const css = await read("../static-source/assets/site.css");
  assert.match(html, /id="creator-post-grid" class="creator-post-grid"/);
  assert.match(html, /id="post-dialog" class="post-dialog"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<a class="post-action-link post-action-primary" href="\/portfolio\/projects\/auralogbook\/">Read the case study<\/a>/);
  assert.match(html, /href="https:\/\/github\.com\/GemsForge\/aura-logbook-api"/);
  assert.match(html, /href="\/admin\/">Admin<\/a>/);
  assert.match(html, /href="\/knowledge\/">Dev Wiki<\/a>/);
  const auraPost = html.slice(html.indexOf('data-post-view="auralogbook"'), html.indexOf('</article>', html.indexOf('data-post-view="auralogbook"')));
  // Recruiter scan order precedes the mobile image and tour; those controls stay paired after the stack.
  const order = ['class="post-lead"', 'class="post-actions"', '<dl class="post-facts">', '<section class="post-decisions">', '<section class="post-tools"><h3>Stack</h3>', 'data-mobile-visual', '<section class="walkthrough"', 'class="post-sequence"'].map((marker) => auraPost.indexOf(marker));
  assert.ok(order.every((position, index) => position >= 0 && (index === 0 || position > order[index - 1])), `pop-up sections are out of order: ${order}`);
  assert.match(auraPost, /<button type="button" class="post-image-zoom" data-post-image-zoom aria-label="Open Aura Logbook walkthrough image in the enlarged viewer"><img src="\/assets\/auralogbook-tour\/public-home-pair\.png" alt="Aura Logbook public landing page on a phone paired with its desktop layout"/);
  assert.match(auraPost, /<nav class="post-step-controls" aria-label="Walkthrough image controls"><button type="button" class="post-step-arrow post-step-prev" data-step-prev aria-label="Previous step">← Previous<\/button><button type="button" class="post-step-arrow post-step-next" data-step-next aria-label="Next step">Next →<\/button><\/nav>/);
  assert.match(auraPost, /class="tech-chip"/);
  assert.match(auraPost, /\/assets\/auralogbook-stack\/react\.png/);
  assert.match(auraPost, /<img src="\/assets\/auralogbook-stack\/react\.png" alt="" loading="lazy" decoding="async"><span>React Native · Expo<\/span>/, "React Native uses the same React logo");
  assert.match(auraPost, /\/assets\/auralogbook-stack\/dapper\.png/);
  assert.match(auraPost, /\/assets\/auralogbook-stack\/jwt-bearer\.png/);
  for (const [name, expected] of [["Vitest", "<svg"], ["Testing Library", "<svg"], ["xUnit", "/assets/auralogbook-stack/xunit.jpg"], ["Moq", "<svg"]]) {
    const labelIndex = auraPost.indexOf(`<span>${name}</span>`);
    const pillStart = auraPost.lastIndexOf('<span class="tech-chip">', labelIndex);
    const pill = labelIndex >= 0 ? auraPost.slice(pillStart, labelIndex) : "";
    assert.ok(pill.includes(expected), `${name} should render its logo`);
  }
  assert.doesNotMatch(auraPost, /<figcaption>/, "post artwork should not have a visible caption below it");
  assert.match(auraPost, /A phone-first journal built across a responsive React client/);
  assert.match(auraPost, /<dt>Scope and status<\/dt>/);
  assert.match(auraPost, /<h3>Engineering decisions<\/h3>/);
  assert.match(auraPost, /<h3 id="walkthrough-auralogbook">Product walkthrough<\/h3>/);
  assert.doesNotMatch(auraPost, /visual-hotspot|data-step-hotspot/, "the Aura Logbook walkthrough has no unused plus marker");
  assert.match(auraPost, /Dapper repositories handling SQLite persistence/);
  assert.match(auraPost, /scope attachment metadata and journal access to the signed-in user/);
  assert.match(script, /history\.pushState/);
  assert.match(script, /window\.addEventListener\("popstate"/);
  assert.doesNotMatch(script, /window\.addEventListener\("hashchange"/, "popstate alone handles fragment navigation; a second listener rendered posts twice");
  assert.match(script, /history\.replaceState\(\{ \.\.\.history\.state, portfolioPost: openedFromGrid \}, "", `#post\/\$\{slug\}`\)/, "Next/Previous replaces the history entry so Close returns to the grid");
  assert.match(script, /if \(focused === next && next\.disabled && !previous\.disabled\) previous\.focus/, "focus moves to the other arrow at either end");
  assert.doesNotMatch(script, /applyFilter|portfolioFilter|data-filter/, "the post client should not keep stale filter behavior or URL state");
  assert.match(script, /portfolioScroll/);
  assert.match(script, /opener\.focus/);
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
  for (const short of ["ADP onboarding", "2 weeks <span aria-hidden=\"true\">→</span> 3 days", "Check-in flow", "Army since 2013"]) {
    assert.ok(html.includes(`<span class="sp-narrow">${short}</span>`), `missing phone text: ${short}`);
  }
  assert.match(html, /<span class="sp-narrow">\{\n  "parent": \{…\},\n  "properties": \{…\}\n\}<\/span>/);
  assert.match(css, /\.sp-narrow\{display:none\}/);
  assert.match(css, /@media\(max-width:650px\)\{[\s\S]*?\.sp-wide\{display:none\}[\s\S]*?\.sp-narrow\{display:inline\}/);
});

test("avatar greeting is decorative, cued, and respects reduced motion", async () => {
  const html = await readGeneratedHome();
  const css = await read("../static-source/assets/site.css");
  const script = await read("../static-source/assets/creator-profile.js");
  const ring = html.slice(html.indexOf("data-avatar-greeting"), html.indexOf("</div>", html.indexOf("data-avatar-greeting")));
  // The photo keeps its alt text; the drawn ring and the typed tag are hidden from assistive technology.
  assert.match(ring, /alt="Diamond Brown smiling at the camera\."/);
  assert.match(ring, /<svg class="sp-avatar-draw" aria-hidden="true"/);
  assert.match(ring, /<span class="sp-hello" aria-hidden="true"><span class="sp-hello-prompt">&gt;<\/span><span class="sp-hello-text" data-hello-text="Hello World"><\/span><span class="sp-hello-caret">_<\/span><\/span>/);
  assert.match(css, /\.is-greeting \.sp-avatar-progress\{stroke-dashoffset:0\}/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.sp-avatar-progress\{transition:none\}\.sp-hello-caret\{animation:none\}\}/);
  assert.match(script, /function setUpAvatarGreeting\(\)/);
  assert.match(script, /if \(reducedMotion\.matches\) output\.textContent = message;/);
  assert.match(script, /event\.pointerType !== "mouse"/, "touch and pen taps toggle the greeting");
});

test("pop-up keeps the walkthrough, swaps in real step screenshots, and meets type and target sizes", async () => {
  const html = await readGeneratedHome();
  const css = await read("../static-source/assets/site.css");
  const script = await read("../static-source/assets/creator-profile.js");
  const auraPost = html.slice(html.indexOf('data-post-view="auralogbook"'), html.indexOf("</article>", html.indexOf('data-post-view="auralogbook"')));
  assert.equal((auraPost.match(/data-walkthrough-step="\d"/g) ?? []).length, 10);
  assert.equal((auraPost.match(/class="visual-hotspot"/g) ?? []).length, 0, "Aura Logbook has no unused plus markers in its walkthrough");
  // Clearly labeled touch controls follow a zoomable image; a screen-reader announcer describes step changes.
  assert.match(auraPost, /<button type="button" class="post-step-arrow post-step-prev" data-step-prev aria-label="Previous step">← Previous<\/button>/);
  assert.match(auraPost, /<button type="button" class="post-step-arrow post-step-next" data-step-next aria-label="Next step">Next →<\/button>/);
  assert.match(auraPost, /<button type="button" class="post-image-zoom" data-post-image-zoom/);
  assert.match(auraPost, /<p class="visually-hidden" data-step-announce aria-live="polite"><\/p>/);
  assert.match(auraPost, /<span class="eyebrow">App tour<\/span>/, "real screens label the walkthrough as an app tour");
  assert.match(auraPost, /<nav class="post-step-controls" aria-label="Walkthrough image controls">/);
  assert.match(auraPost, /View source <span class="visually-hidden">\(opens in a new tab\)<\/span>/);
  // A catalog step with `screenshot` shows that real screen and hides its hotspot.
  assert.match(script, /const screenshot = step\.dataset\.stepScreenshot;/);
  assert.match(script, /const onScreen = screenshot && step\.dataset\.stepHotspotX;/, "a screenshot's own hotspot moves the marker onto the real UI");
  assert.match(script, /previous\.disabled = index === 0;/);
  assert.match(script, /next\.disabled = index === steps\.length - 1;/);
  assert.match(css, /#post-dialog \.is-step-screenshot \.post-visual-stage\{width:fit-content;max-width:100%;max-height:none;aspect-ratio:auto/, "screenshots keep their own shape");
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{#post-dialog \.post-visual-stage>img\.is-fading\{animation:none\}\}/);
  assert.match(css, /#post-dialog \.post-step-arrow\{[^}]*min-height:48px/);
  assert.match(css, /#post-dialog \.post-step-controls\{display:flex;justify-content:space-between;gap:12px;margin-top:12px\}/);
  assert.match(html, /<dialog id="post-image-dialog" class="post-image-dialog" aria-labelledby="post-image-dialog-title" aria-describedby="post-image-dialog-help">/);
  assert.match(script, /imageDialog\.showModal\(\)/, "the enlarged image stays in the current page in a modal");
  assert.match(script, /imageDialog\?\.addEventListener\("close", \(\) => \{[\s\S]*?imageOpener\.focus/);
  assert.match(css, /#post-dialog \.post-story\{font-size:15px/);
  assert.match(css, /#post-dialog \.walkthrough-steps p,#post-dialog \.walkthrough-status\{font-size:15px/);
  assert.match(css, /#post-dialog \.walkthrough-disclaimer\{font-size:13px;line-height:1\.45;color:#4d5d50\}/);
  assert.match(css, /#post-dialog \.visual-hotspot\{width:44px;height:44px\}/);
  assert.match(css, /#post-dialog \.post-close\{width:44px;height:44px/);
  assert.match(css, /#post-dialog \.post-sequence button\{min-height:44px/);
});

test("catalog text is escaped inside generated attributes, and /portfolio/ renders from the homepage source", async () => {
  const builder = await read("../scripts/prepare-pages.mjs");
  assert.match(builder, /function attr\(value\)/);
  assert.match(builder, /data-step-screenshot-alt="\$\{attr\(shot\.alt\)\}"/);
  assert.match(builder, /aria-label="Open post: \$\{attr\(label\)\}"/);
  assert.match(builder, /for \(const route of baseRoute === "\/" \? \["\/", "\/portfolio\/"\] : \[baseRoute\]\)/);
  const html = await readGeneratedHome();
  assert.match(html, /aria-label="Open post: Dynamic Folder Structures\. Automation &amp; technical guide/, "ampersands in labels are encoded");
  const css = await read("../static-source/assets/site.css");
  assert.match(css, /\.sp-main \.creator-post-tile:focus-visible,\.sp-main \.sp-feature-tile:focus-visible\{outline:3px solid #f4f2e8;outline-offset:-6px/);
  assert.doesNotMatch(css, /\.profile-tech-strip|\.creator-shell|\.tile-caption/, "legacy creator-profile rules are removed");
});

test("pop-up applies published step screenshots from the asset manager, newest first", async () => {
  const script = await read("../static-source/assets/creator-profile.js");
  assert.match(script, /fetch\(`\/api\/media\?project=\$\{encodeURIComponent\(slug\)\}`\)/);
  assert.match(script, /item\.kind === "image" && item\.placement && !byStep\.has\(item\.placement\.step\)/, "the newest published image wins a step");
  assert.match(script, /\.catch\(\(\) => \[\]\)/, "a failed request keeps the built-in pictures");
  assert.match(script, /if \(eyebrow\) eyebrow\.textContent = "App tour";/);
  const steps = JSON.parse(await read("../lib/walkthrough-steps.json"));
  assert.deepEqual(steps.auralogbook, ["Public home", "Sign in", "Dashboard", "Check in", "Revisit reflections", "Read one entry", "Browse photos", "Notice patterns", "Choose an appearance", "Connect Spotify"]);
});
