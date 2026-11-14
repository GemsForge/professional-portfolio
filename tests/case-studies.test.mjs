import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PROJECTS } from "../scripts/project-catalog.mts";

/**
 * Case study pages are React components rendered to static HTML at build
 * time (#132). These checks keep the components as the single source: no HTML
 * templates remain, no raw HTML injection is used, and every page reflects the
 * project catalog.
 */
const pages = JSON.parse(await readFile("lib/static-pages.json", "utf8"));
const registry = await readFile("components/case-studies/index.ts", "utf8");
const componentFiles = (await readdir("components/case-studies")).filter((name) => /\.tsx?$/.test(name));

test("every catalog project has a registered case study component and generated page", () => {
  for (const slug of Object.keys(PROJECTS)) {
    assert.match(registry, new RegExp(`"?${slug}"?: \\w+CaseStudy`), `missing case study registration: ${slug}`);
    assert.ok(pages[`/portfolio/projects/${slug}/`], `missing generated page: ${slug}`);
  }
});

test("static-source keeps no case study HTML templates", async () => {
  const entries = await readdir("static-source/portfolio/projects", { withFileTypes: true });
  assert.deepEqual(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name), []);
});

test("case study components render body content without raw HTML injection", async () => {
  for (const name of componentFiles) {
    const source = await readFile(`components/case-studies/${name}`, "utf8");
    assert.doesNotMatch(source, /dangerouslySetInnerHTML/, `${name} injects raw HTML`);
  }
});

test("generated case studies carry catalog content and the shared shell", () => {
  for (const project of Object.values(PROJECTS)) {
    const html = pages[`/portfolio/projects/${project.slug}/`];
    assert.ok(html.startsWith("<!doctype html>"), `${project.slug} is not a complete document`);
    assert.ok(html.includes(`<title>${project.name} · Diamond Brown</title>`), `${project.slug} title`);
    assert.ok(html.includes(`<h1>${project.name}</h1>`), `${project.slug} heading`);
    assert.ok(html.includes(project.preTitle.replace(/&/g, "&amp;")), `${project.slug} pre-title`);
    assert.match(html, /<body class="rd">/);
    assert.match(html, /<div class="rd-topbar">/);
    assert.equal((html.match(/<header/g) ?? []).length, 1, `${project.slug} renders one header`);
    assert.match(html, new RegExp(`<section data-project-gallery="${project.slug}" hidden(?:="")?></section><nav class="next-project"`));
    assert.match(html, /<script src="\/assets\/gallery\.js" defer(?:="")?><\/script>/);
    // React 19 would otherwise hoist a preload for every eager image.
    assert.doesNotMatch(html, /rel="preload" as="image"/);
    assert.doesNotMatch(html, /data-dependency-group=/, `${project.slug} left a dependency slot unrendered`);
  }
});

/* Content files (#136): page text lives in content/case-studies/, not in components. */
const { parseInline } = await import("../components/case-studies/inline-markup.ts");

test("inline markup parses formatting and links without HTML", () => {
  assert.deepEqual(parseInline("Plain text"), ["Plain text"]);
  assert.deepEqual(parseInline("A **bold *nested* word** and `code`"), [
    "A ",
    { kind: "strong", children: ["bold ", { kind: "em", children: ["nested"] }, " word"] },
    " and ",
    { kind: "code", text: "code" },
  ]);
  assert.deepEqual(parseInline("[Docs](https://example.com new-tab) and [home](/)"), [
    { kind: "link", href: "https://example.com", newTab: true, children: ["Docs"] },
    " and ",
    { kind: "link", href: "/", newTab: false, children: ["home"] },
  ]);
  assert.deepEqual(parseInline("A literal \\* star"), ["A literal * star"]);
});

test("inline markup rejects unclosed markers so bad content fails the build", () => {
  for (const bad of ["**open", "*open", "`open", "[label](", "[label](/x unknown)"]) {
    assert.throws(() => parseInline(bad), undefined, bad);
  }
});

test("every case study has a content file and components hold no page prose", async () => {
  for (const slug of Object.keys(PROJECTS)) {
    const content = await readFile(`content/case-studies/${slug}.ts`, "utf8");
    assert.match(content, /export const \w+Content: \w+Content = \{/, `${slug} content export`);
    assert.doesNotMatch(content, /<\/?(p|strong|em|a|code|div|span)\b/, `${slug} content contains raw HTML`);
    const component = await readFile(`components/case-studies/${slug}.tsx`, "utf8");
    assert.match(component, new RegExp(`from "\\.\\./\\.\\./content/case-studies/${slug}\\.ts"`), `${slug} reads its content file`);
    assert.doesNotMatch(component, /<p>[A-Z][^<{]{20,}/, `${slug} component still hard-codes a paragraph`);
  }
});
