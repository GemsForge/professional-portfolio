import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  applySocialMetadata,
  renderRobots,
  renderSitemap,
  SITE_ORIGIN,
} from "../scripts/site-metadata.mjs";

const samplePage = `<!doctype html><html><head><meta name="description" content="About Diamond."><title>About &amp; more · Diamond Brown</title><link rel="canonical" href="${SITE_ORIGIN}/about/"></head><body></body></html>`;

test("adds page-specific Open Graph and Twitter tags", () => {
  const html = applySocialMetadata(samplePage, "/about/");
  assert.match(html, /<meta property="og:title" content="About &amp; more · Diamond Brown">/);
  assert.match(html, /<meta property="og:description" content="About Diamond.">/);
  assert.match(html, new RegExp(`<meta property="og:url" content="${SITE_ORIGIN}/about/">`));
  assert.match(html, new RegExp(`<meta property="og:image" content="${SITE_ORIGIN}/assets/profile-photo.jpg">`));
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /<meta name="twitter:card" content="summary">/);
  assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
});

test("adds a canonical link when the page lacks one and is idempotent", () => {
  const page = samplePage.replace(/<link rel="canonical"[^>]*>/, "");
  const once = applySocialMetadata(page, "/portfolio/projects/hair-log/");
  assert.match(once, new RegExp(`<link rel="canonical" href="${SITE_ORIGIN}/portfolio/projects/hair-log/">`));
  assert.equal(applySocialMetadata(once, "/portfolio/projects/hair-log/"), once);
});

test("sitemap lists public pages and omits legacy redirects", () => {
  const xml = renderSitemap(["/contact/", "/", "/contacts/", "/about/"]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, new RegExp(`<loc>${SITE_ORIGIN}/</loc>`));
  assert.match(xml, new RegExp(`<loc>${SITE_ORIGIN}/contact/</loc>`));
  assert.doesNotMatch(xml, /\/contacts\/|\/admin\//);
});

test("robots.txt blocks owner routes and references the sitemap", () => {
  const robots = renderRobots();
  assert.match(robots, /^Disallow: \/admin\/$/m);
  assert.match(robots, /^Disallow: \/api\/$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${SITE_ORIGIN}/sitemap.xml$`, "m"));
});

test("worker redirects legacy routes before serving pages", async () => {
  const worker = await readFile(new URL("../build/sites-worker.ts", import.meta.url), "utf8");
  assert.match(worker, /LEGACY_REDIRECTS/);
  assert.match(worker, /Response\.redirect\(new URL\(legacyTarget, url\)\.toString\(\), 301\)/);
});

test("about, contact, and projects have distinct meta descriptions", async () => {
  const descriptions = await Promise.all(
    ["about", "contact", "portfolio/projects"].map(async (route) => {
      const html = await readFile(new URL(`../static-source/${route}/index.html`, import.meta.url), "utf8");
      return /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
    }),
  );
  assert.equal(new Set(descriptions).size, 3);
  for (const description of descriptions) {
    assert.doesNotMatch(description, /^Diamond Brown’s software development, systems design, and automation portfolio\.$/);
  }
});
