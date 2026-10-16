import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const page = new URL("../static-source/about/index.html", import.meta.url);
const homePage = new URL("../static-source/index.html", import.meta.url);
const stylesheet = new URL("../static-source/assets/site.css", import.meta.url);
const portrait = new URL("../static-source/assets/profile-photo.jpg", import.meta.url);

test("About page presents the optimized profile photo accessibly", async () => {
  const [html, css, imageStats] = await Promise.all([
    readFile(page, "utf8"),
    readFile(stylesheet, "utf8"),
    stat(portrait),
  ]);

  assert.match(html, /<img[^>]*src="\/assets\/profile-photo\.jpg"[^>]*alt="Diamond Brown smiling at the camera\."/);
  assert.match(html, /width="1200"\s+height="1200"/);
  assert.equal((html.match(/src="\/assets\/profile-photo\.jpg"/g) ?? []).length, 1, "About should show the portrait once");
  const homeHtml = await readFile(homePage, "utf8");
  assert.match(homeHtml, /<div class="hero-art">[\s\S]*?role="img" aria-label="Abstract intersecting paths converge into a diamond, then emerge as aligned lines"/);
  assert.equal((homeHtml.match(/src="\/assets\/profile-photo\.jpg"/g) ?? []).length, 1, "Home should show the portrait once in the About section");
  assert.match(homeHtml, /<section id="about" class="dark"><div class="wrap about-grid"><div><img class="about-section-portrait" src="\/assets\/profile-photo\.jpg"/);
  assert.match(css, /\.about-hero\s*\{[^}]*display:grid/);
  assert.match(css, /\.about-section-portrait\s*\{[^}]*aspect-ratio:4\/5/);
  assert.match(css, /@media\s*\(max-width:\s*650px\)\s*\{\.about-hero\s*\{[^}]*grid-template-columns:1fr/);
  const contactPage = await readFile(new URL("../static-source/contact/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(contactPage, /profile-photo\.jpg/);
  assert.ok(imageStats.size < 500_000, "profile photo should stay below 500 KB");
});
