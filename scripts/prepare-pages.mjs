import { cp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { siDotnet, siOpenjdk, siPostgresql } from "simple-icons";
// Node 22.13+ strips the catalog's TypeScript types at import time; no runtime
// transpiler or JSX dependency is needed for this build-time-only module.
import { renderDependencyGroup } from "./auralogbook-dependencies.mts";
import { applyProjectPageMetadata, HOME_PROJECT_SLUGS, PORTFOLIO_POSTS, PROJECTS, renderProjectCard } from "./project-catalog.mts";

const source = path.resolve("static-source");
const pages = {};
const PROFILE_TECHNOLOGIES = [
  { label: "C#", image: "/assets/auralogbook-stack/csharp.png" },
  { label: ".NET", icon: siDotnet },
  { label: "React", image: "/assets/auralogbook-stack/react.png" },
  { label: "TypeScript", image: "/assets/auralogbook-stack/typescript.png" },
  { label: "Redux", image: "/assets/auralogbook-stack/redux.png" },
  { label: "PostgreSQL", icon: siPostgresql },
  { label: "Java", icon: siOpenjdk },
  { label: "Notion", image: "/assets/auralogbook-stack/notion.png" },
];

/** Renders the existing portfolio technology marks as links to the stack story. */
function renderProfileTechStrip() {
  const items = PROFILE_TECHNOLOGIES.map((technology) => {
    const logo = technology.image
      ? `<img src="${technology.image}" alt="" loading="lazy" decoding="async">`
      : `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" style="--tech-color:#${technology.icon.hex}"><path fill="currentColor" d="${technology.icon.path}"></path></svg>`;
    return `<li><a href="/about/" data-post-link="tech-stack" aria-label="Open ${technology.label} in the Tech Stack story"><span class="profile-tech-mark">${logo}</span><span>${technology.label}</span></a></li>`;
  }).join("");
  return `<nav class="profile-tech-strip" aria-label="Technology stack"><ul>${items}</ul></nav>`;
}

/** Emits the image-led, progressive-enhancement post grid from the typed catalog. */
function renderCreatorGrid() {
  return PORTFOLIO_POSTS.filter((post) => post.category !== "tech-stack").map((post, index) => {
    const fallback = post.caseStudy ?? (post.slug === "tech-stack" ? "/about/" : "#about");
    const category = post.category === "tech-stack" ? "Tech Stack" : post.category === "process" ? "Process" : "Project";
    const label = `${post.title}. ${category}. ${post.eyebrow}`;
    return `<a class="creator-post-tile tile-${post.slug}" href="${fallback}" data-post-link="${post.slug}" data-category="${post.category}" aria-label="Open post: ${label}"><span class="tile-art"><img src="${post.image}" alt="" width="720" height="720" loading="${index < 3 ? "eager" : "lazy"}"><span class="tile-overline">${category} <span aria-hidden="true">✳</span></span><span class="tile-title">${post.title}</span><span class="tile-caption">${post.caption}</span><span class="tile-open" aria-hidden="true">↗</span></span></a>`;
  }).join("");
}

/** Emits concise post stories with Tech after the facts and image descriptions in alt text. */
function renderPostViews() {
  return PORTFOLIO_POSTS.map((post, index) => {
    const chips = post.tools.map((tool) => `<span class="post-tool-chip">${tool}</span>`).join("");
    const decisions = post.decisions.map((decision) => `<li>${decision}</li>`).join("");
    const links = [
      post.caseStudy ? `<a class="post-action-link" href="${post.caseStudy}">Read the full case study <span aria-hidden="true">↗</span></a>` : "",
      post.source ? `<a class="post-action-link" href="${post.source}" target="_blank" rel="noopener noreferrer">Inspect source <span aria-hidden="true">↗</span></a>` : "",
    ].filter(Boolean).join("");
    const groupedStack = post.stackGroups ? `<section class="stack-groups" aria-label="Technologies linked to project evidence">${post.stackGroups.map((group) => `<div class="stack-group"><h4>${group.label}</h4><div>${group.items.map((item) => `<a href="${item.href ?? `#post/${item.postSlug}`}"${item.postSlug ? ` data-post-link="${item.postSlug}"` : ""}>${item.label}<span aria-hidden="true"> ↗</span></a>`).join("")}</div></div>`).join("")}</section>` : "";
    const techContent = post.stackGroups ? groupedStack : `<div class="post-tool-list">${chips}</div>`;
    const walkthrough = post.walkthrough ? `<section class="walkthrough" aria-labelledby="walkthrough-${post.slug}"><div class="walkthrough-heading"><div><span class="eyebrow">Illustrative prototype</span><h3 id="walkthrough-${post.slug}">Walk through the idea</h3></div><span class="walkthrough-counter" data-step-counter>01 / ${String(post.walkthrough.length).padStart(2, "0")}</span></div><ol class="walkthrough-steps" data-walkthrough="${post.slug}">${post.walkthrough.map((step, stepIndex) => `<li data-walkthrough-step="${stepIndex}"><span class="walkthrough-step-no">${String(stepIndex + 1).padStart(2, "0")}</span><div><h4>${step.title}</h4><p>${step.detail}</p></div></li>`).join("")}</ol><p class="walkthrough-status" data-walkthrough-status aria-live="polite"></p><div class="walkthrough-controls" hidden><button type="button" data-step-prev>← Previous</button><button type="button" data-step-next>Next step →</button></div><p class="walkthrough-disclaimer">A guided prototype based on the documented project flow; not a live production app.</p></section>` : "";
    const visualHotspots = post.walkthrough ? post.walkthrough.map((step, stepIndex) => `<button type="button" class="visual-hotspot" data-visual-hotspot="${stepIndex}" data-hotspot-label="${step.hotspot.label}" data-hotspot-detail="${step.detail}" style="--hotspot-x:${step.hotspot.x}%;--hotspot-y:${step.hotspot.y}%" aria-label="Explore: ${step.hotspot.label}"><span aria-hidden="true">+</span></button>`).join("") : "";
    return `<article class="post-story" data-post-view="${post.slug}" aria-labelledby="post-title-${post.slug}" hidden><template class="post-visual-template"><figure class="post-main-visual"><div class="post-visual-stage"><img src="${post.image}" alt="${post.imageAlt}" width="960" height="960">${visualHotspots}</div></figure></template><div class="post-story-topline"><span>${post.eyebrow}</span><span>${String(index + 1).padStart(2, "0")} / ${String(PORTFOLIO_POSTS.length).padStart(2, "0")}</span></div><h2 id="post-title-${post.slug}">${post.title}</h2><p class="post-lead">${post.caption}</p><dl class="post-facts"><div><dt>My role</dt><dd>${post.role}</dd></div><div><dt>Evidence &amp; status</dt><dd>${post.evidence}</dd></div></dl><section class="post-tools"><h3>Tech</h3>${techContent}</section>${walkthrough}<section class="post-decisions"><h3>Decisions that shaped it</h3><ul>${decisions}</ul></section>${links ? `<nav class="post-actions" aria-label="Related project links">${links}</nav>` : ""}<nav class="post-sequence" aria-label="Browse other posts"><button type="button" data-adjacent-post="previous">← Previous post</button><button type="button" data-adjacent-post="next">Next post →</button></nav></article>`;
  }).join("");
}

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (entry.name !== "index.html") continue;

    let route = `/${path.relative(source, directory).split(path.sep).filter(Boolean).join("/")}`;
    route = route === "/" ? route : `${route}/`;
    let text = await readFile(file, "utf8");

    const project = PROJECTS[route.split("/").filter(Boolean).at(-1) ?? ""];
    if (project) text = applyProjectPageMetadata(text, project);

    if (route === "/" || route === "/portfolio/" || route === "/portfolio/projects/") {
      const projects = route === "/" || route === "/portfolio/"
        ? HOME_PROJECT_SLUGS.map((slug) => PROJECTS[slug])
        : Object.values(PROJECTS);

      if (route === "/" || route === "/portfolio/") {
        text = text.replace('<div id="profile-tech-strip-slot"></div>', renderProfileTechStrip());
        text = text.replace(
          /<div id="creator-post-grid" class="creator-post-grid" aria-label="Portfolio posts"><\/div>/,
          `<div id="creator-post-grid" class="creator-post-grid" aria-label="Portfolio posts">${renderCreatorGrid()}</div>`,
        );
        // Keep the full story catalog mounted separately so filtering and the dialog can move one story without losing the others.
        text = text.replace('<div id="post-stories"></div>', `<div id="post-stories">${renderPostViews()}</div>`);
        if (!text.includes('data-post-view="auralogbook"') || !text.includes("creator-profile.js")) {
          throw new Error("Creator posts were not rendered into the profile page.");
        }
      }

      for (const project of projects) {
        text = text.replace(
          new RegExp(`<article class="project"><a href="/portfolio/projects/${project.slug}/"[\\s\\S]*?<\\/article>`),
          renderProjectCard(project),
        );
      }
    }

    // Keep the product name readable in user-facing portfolio copy while
    // preserving AuraLogbook for technical identifiers and source links.
    text = text
      .replace(/>AuraLogbook</g, ">Aura Logbook<")
      .replace(/Explore AuraLogbook/g, "Explore Aura Logbook")
      .replace(/Next: AuraLogbook/g, "Next: Aura Logbook")
      .replace(/AuraLogbook is/g, "Aura Logbook is")
      .replace(/<title>AuraLogbook ·/g, "<title>Aura Logbook ·");

    if (route === "/portfolio/projects/auralogbook/") {
      const architecture = await readFile(
        path.join(directory, "architecture.html"),
        "utf8",
      );
      const schemas = await readFile(
        path.join(directory, "schemas.html"),
        "utf8",
      );
      text = text.replace(
        '<div id="auralogbook-architecture-slot"></div>',
        `${architecture}${schemas}`,
      );
      text = text.replace(
        /<div data-dependency-group="([a-zA-Z0-9-]+)"><\/div>/g,
        (_match, groupId) => renderDependencyGroup(groupId),
      );
      if (text.includes("data-dependency-group=")) {
        throw new Error("An AuraLogbook dependency group was not rendered.");
      }
    }

    if (route === "/portfolio/projects/75-hard-automation/") {
      text = text.replace(
        /<div data-dependency-group="([a-zA-Z0-9-]+)"><\/div>/g,
        (_match, groupId) => renderDependencyGroup(groupId),
      );
    }

    if (
      route === "/portfolio/projects/hair-log/" ||
      route === "/portfolio/projects/75-hard-automation/"
    ) {
      const slug = route.split("/").filter(Boolean).at(-1);
      const responsibilities = await readFile(
        path.join(source, "portfolio", "projects", slug, "responsibilities.html"),
        "utf8",
      );
      const sectionStart = text.indexOf('<section id="dependencies">');
      const sectionEnd = text.indexOf("</section>", sectionStart);
      if (sectionStart < 0 || sectionEnd < 0) {
        throw new Error(`Missing dependencies section in ${route}`);
      }
      text =
        text.slice(0, sectionStart) +
        responsibilities +
        text.slice(sectionEnd + "</section>".length);
    }

    if (route.startsWith("/portfolio/projects/") && route !== "/portfolio/projects/") {
      const slug = route.split("/").filter(Boolean).at(-1);
      text = text.replace(
        '<nav class="next-project"',
        `<section data-project-gallery="${slug}" hidden></section><nav class="next-project"`,
      );
      text = text.replace(
        "</body>",
        '<script src="/assets/gallery.js" defer></script></body>',
      );
    }

    if (text.includes('<nav aria-label="Footer navigation">')) {
      text = text.replace(
        '<nav aria-label="Footer navigation">',
        // Keep the owner tools and public Wiki reachable from every generated portfolio footer.
        '<nav aria-label="Footer navigation"><a href="/admin/">Admin</a><a href="/knowledge/">Dev Wiki</a>',
      );
    }

    pages[route] = text;
  }
}

await visit(source);
await writeFile("lib/static-pages.json", JSON.stringify(pages));
await cp("static-source/assets", "public/assets", { recursive: true });
console.log(`Prepared ${Object.keys(pages).length} portfolio pages.`);
