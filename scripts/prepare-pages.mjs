import { cp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { siApple, siDotnet, siMui, siOpenjdk, siPostgresql, siSpotify } from "simple-icons";
// Node 22.13+ strips the catalog's TypeScript types at import time; no runtime
// transpiler or JSX dependency is needed for this build-time-only module.
import { renderDependencyGroup } from "./auralogbook-dependencies.mts";
import { applySocialMetadata, renderRobots, renderSitemap } from "./site-metadata.mjs";
import { applyProjectPageMetadata, HOME_PROJECT_SLUGS, PORTFOLIO_POSTS, PROJECTS, renderProjectCard } from "./project-catalog.mts";

const source = path.resolve("static-source");
const pages = {};
const TECH_PILL_MARKS = {
  "C#": { image: "/assets/auralogbook-stack/csharp.png" },
  ".NET": { icon: siDotnet },
  React: { image: "/assets/auralogbook-stack/react.png" },
  TypeScript: { image: "/assets/auralogbook-stack/typescript.png" },
  Redux: { image: "/assets/auralogbook-stack/redux.png" },
  "Redux Toolkit": { image: "/assets/auralogbook-stack/redux.png" },
  "Redux Toolkit · RTK Query": { image: "/assets/auralogbook-stack/redux.png" },
  "C#": { image: "/assets/auralogbook-stack/csharp.png" },
  MUI: { icon: siMui },
  "MUI · Joy UI": { icon: siMui },
  PostgreSQL: { icon: siPostgresql },
  SQLite: { image: "/assets/auralogbook-stack/sqlite.png" },
  Dapper: { image: "/assets/auralogbook-stack/dapper.png" },
  JWT: { image: "/assets/auralogbook-stack/jwt-bearer.png" },
  "Spotify API": { icon: siSpotify },
  "Spotify Web API · OAuth": { icon: siSpotify },
  Java: { icon: siOpenjdk },
  Notion: { image: "/assets/auralogbook-stack/notion.png" },
  "Notion API": { image: "/assets/auralogbook-stack/notion.png" },
  "Apple Shortcuts": { icon: siApple },
};

/** Renders a tool label and any available brand mark using the project-card pill assets. */
function renderTechPillContents(tool) {
  const mark = TECH_PILL_MARKS[tool];
  const logo = mark?.image
    ? `<img src="${mark.image}" alt="" loading="lazy" decoding="async">`
    : mark?.icon
      ? `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" style="--tech-color:#${mark.icon.hex}"><path fill="currentColor" d="${mark.icon.path}"></path></svg>`
      : "";
  return `${logo}<span>${tool}</span>`;
}

/** Renders a tool as the same pill used on project cards. */
function renderTechPill(tool) {
  return `<span class="tech-chip">${renderTechPillContents(tool)}</span>`;
}

/**
 * Project posts are the only posts featured on the profile. The grid and the
 * post views both render from this list, so Next/Previous (which cycles through
 * every rendered post view) can never reach a post without a grid tile. The
 * catalog's process and Tech Stack entries stay as data but are not rendered.
 */
const GRID_POSTS = PORTFOLIO_POSTS.filter((post) => post.category === "project");

/** Title-bar text for each project tile (Direction D); facts come from the case studies. */
const TILE_TITLES = {
  auralogbook: "Aura Logbook · React + .NET",
  "notion-api-shortcuts": "Notion API integration",
  "75-hard-automation": "75 Days · 13 Shortcuts",
  "hair-log": "Hair Care Log · Notion API",
  "dynamic-folder-structures": "Dynamic Folder Structures",
  "apple-ecosystem": "Apple-native system",
};

/** The 75 Days tile uses the real Shortcuts folder screenshot instead of the illustration. */
const TILE_IMAGES = {
  "75-hard-automation": { src: "/assets/75-days-shortcuts-overview.png", width: 636, height: 1406, position: "top" },
};

/**
 * Non-project posts placed after the named project slug. They open an
 * experience highlight or an existing project post, so they never add a post
 * view (Next/Previous still cycles through project posts only).
 */
const FEATURE_TILES = {
  auralogbook: [
    `<a class="sp-feature-tile sp-tile-quote" href="/work/enterprise-applications/" data-highlight-link="adp" aria-label="Quote post: at ADP, developer onboarding went from two weeks to three days. Open the ADP highlight."><span class="sp-tile-eyebrow">ADP · Developer enablement</span><span class="sp-tile-quote-text">Onboarding: two weeks <span aria-hidden="true">→</span> three days.</span><span class="sp-tile-note">Setup guides new developers actually used.</span></a>`,
  ],
  "75-hard-automation": [
    `<a class="sp-feature-tile sp-tile-diagram" href="/portfolio/projects/75-hard-automation/" data-post-link="75-hard-automation" aria-label="Diagram post: how a 75 Days check-in flows from Shortcut prompts to a Notion record. Open the 75 Days of Discipline post."><span class="sp-tile-eyebrow">How a check-in flows</span><span class="sp-flow-step">Shortcut prompts</span><span class="sp-flow-arrow" aria-hidden="true">↓</span><span class="sp-flow-step">Response dictionary</span><span class="sp-flow-arrow" aria-hidden="true">↓</span><span class="sp-flow-step sp-flow-end">Notion API → daily record</span></a>`,
    `<a class="sp-feature-tile sp-tile-text" href="/about/" data-highlight-link="army" aria-label="Text post: Army National Guard Staff Sergeant and Squad Leader since 2013. Open the Army Guard highlight."><span class="sp-tile-eyebrow">Army National Guard</span><span class="sp-tile-quote-text">Staff Sergeant. Squad Leader. Since 2013.</span><span class="sp-tile-note">Training, readiness, accountability.</span></a>`,
  ],
};

/** A simplified, labeled request body; it shows the payload shape, never real IDs or secrets. */
const NOTION_CODE = `{
  "parent": {
    "database_id": "<span class="sp-code-mark">…</span>"
  },
  "properties": {
    "Name": { "title": [ … ] },
    "Status": { "select": … }
  }
}`;

/** Renders the visual inside a project tile: pinned art, a code block, or an image. */
function renderTileVisual(post, index) {
  if (post.slug === "notion-api-shortcuts") {
    return `<span class="sp-code" aria-hidden="true"><span class="sp-code-head"><span>POST /v1/pages</span><span>Simplified</span></span><span class="sp-code-body">${NOTION_CODE}</span></span>`;
  }
  const image = TILE_IMAGES[post.slug] ?? { src: post.image, width: 720, height: 720 };
  const position = image.position ? ` style="object-position:center ${image.position}"` : "";
  const pin = index === 0 ? `<span class="sp-tile-pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 3H8l1 2v5l-3 4h5v7l1 1 1-1v-7h5l-3-4V5z"></path></svg></span>` : "";
  return `<img src="${image.src}" alt="" width="${image.width}" height="${image.height}"${position} loading="${index < 3 ? "eager" : "lazy"}">${pin}`;
}

/** Emits the 3 × 3 profile grid: project tiles in catalog order with feature posts between them. */
function renderCreatorGrid() {
  return GRID_POSTS.map((post, index) => {
    const fallback = post.caseStudy ?? "#posts";
    const pinned = index === 0 ? "Pinned. " : "";
    const label = `${pinned}${post.title}. ${post.eyebrow}. ${post.caption}`;
    const tile = `<a class="creator-post-tile tile-${post.slug}" href="${fallback}" data-post-link="${post.slug}" aria-label="Open post: ${label}">${renderTileVisual(post, index)}<span class="sp-tile-bar">${TILE_TITLES[post.slug] ?? post.title}</span></a>`;
    return tile + (FEATURE_TILES[post.slug] ?? []).join("");
  }).join("");
}

/** Emits one concise story view per grid post, in grid order. */
function renderPostViews() {
  // Keep every post header focused on its title; post navigation already supplies previous/next movement.
  return GRID_POSTS.map((post) => {
    const chips = post.tools.map(renderTechPill).join("");
    const decisions = post.decisions.map((decision) => `<li>${decision}</li>`).join("");
    const links = [
      post.caseStudy ? `<a class="post-action-link" href="${post.caseStudy}">Read the full case study <span aria-hidden="true">↗</span></a>` : "",
      post.source ? `<a class="post-action-link" href="${post.source}" target="_blank" rel="noopener noreferrer">Inspect source <span aria-hidden="true">↗</span></a>` : "",
    ].filter(Boolean).join("");
    const groupedStack = post.stackGroups ? `<section class="stack-groups" aria-label="Technology groups">${post.stackGroups.map((group) => `<div class="stack-group"><h4>${group.label}</h4><div>${group.items.map((item) => item.href || item.postSlug ? `<a class="tech-chip" href="${item.href ?? `#post/${item.postSlug}`}"${item.postSlug ? ` data-post-link="${item.postSlug}"` : ""}>${renderTechPillContents(item.label)}<span aria-hidden="true"> ↗</span></a>` : `<span class="tech-chip">${renderTechPillContents(item.label)}</span>`).join("")}</div></div>`).join("")}</section>` : "";
    const techContent = post.stackGroups ? groupedStack : `<div class="post-tool-list">${chips}</div>`;
    // Let the story name its status plainly while keeping the shared facts layout unchanged.
    const facts = post.role && post.evidence ? `<dl class="post-facts"><div><dt>My role</dt><dd>${post.role}</dd></div><div><dt>${post.evidenceLabel ?? "Evidence &amp; status"}</dt><dd>${post.evidence}</dd></div></dl>` : "";
    const techSection = post.category === "tech-stack" ? `<section class="post-tools stack-profile">${techContent}</section>` : `<section class="post-tools"><h3>Tech</h3>${techContent}</section>`;
    // Reserve an in-story mount point so mobile can place the matching visual between Tech and the walkthrough.
    const mobileVisualSlot = `<div class="post-mobile-visual" data-mobile-visual></div>`;
    // Keep each story heading aligned with the kind of evidence in its decision list.
    const decisionsSection = post.decisions.length ? `<section class="post-decisions"><h3>${post.decisionsTitle ?? "Decisions that shaped it"}</h3><ul>${decisions}</ul></section>` : "";
    // Step titles and previous/next controls give sequence context without modal progress counts.
    const walkthrough = post.walkthrough ? `<section class="walkthrough" aria-labelledby="walkthrough-${post.slug}"><div class="walkthrough-heading"><div><span class="eyebrow">Illustrative prototype</span><h3 id="walkthrough-${post.slug}">Walkthrough</h3></div></div><ol class="walkthrough-steps" data-walkthrough="${post.slug}">${post.walkthrough.map((step, stepIndex) => `<li data-walkthrough-step="${stepIndex}"><div><h4>${step.title}</h4><p>${step.detail}</p></div></li>`).join("")}</ol><p class="walkthrough-status" data-walkthrough-status aria-live="polite"></p><div class="walkthrough-controls" hidden><button type="button" data-step-prev>← Previous</button><button type="button" data-step-next>Next step →</button></div><p class="walkthrough-disclaimer">A guided prototype based on the documented project flow; not a live production app.</p></section>` : "";
    const visualHotspots = post.walkthrough ? post.walkthrough.map((step, stepIndex) => `<button type="button" class="visual-hotspot" data-visual-hotspot="${stepIndex}" data-hotspot-label="${step.hotspot.label}" data-hotspot-detail="${step.detail}" style="--hotspot-x:${step.hotspot.x}%;--hotspot-y:${step.hotspot.y}%" aria-label="Explore: ${step.hotspot.label}"><span aria-hidden="true">+</span></button>`).join("") : "";
    return `<article class="post-story" data-post-view="${post.slug}" aria-labelledby="post-title-${post.slug}" hidden><template class="post-visual-template"><figure class="post-main-visual"><div class="post-visual-stage"><img src="${post.image}" alt="${post.imageAlt}" width="960" height="960">${visualHotspots}</div></figure></template><div class="post-story-topline"><span>${post.eyebrow}</span></div><h2 id="post-title-${post.slug}">${post.title}</h2><p class="post-lead">${post.caption}</p>${facts}${techSection}${mobileVisualSlot}${walkthrough}${decisionsSection}${links ? `<nav class="post-actions" aria-label="Related project links">${links}</nav>` : ""}<nav class="post-sequence" aria-label="Browse other posts"><button type="button" data-adjacent-post="previous">← Previous post</button><button type="button" data-adjacent-post="next">Next post →</button></nav></article>`;
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

    // Social previews run last so they read the final title and description.
    text = applySocialMetadata(text, route);

    pages[route] = text;
  }
}

await visit(source);
await writeFile("lib/static-pages.json", JSON.stringify(pages));
await cp("static-source/assets", "public/assets", { recursive: true });
// Static crawler files are served from public/ ahead of the page fallback.
await writeFile("public/robots.txt", renderRobots());
await writeFile("public/sitemap.xml", renderSitemap(Object.keys(pages)));
console.log(`Prepared ${Object.keys(pages).length} portfolio pages.`);
