/**
 * User-facing project data shared by cards and detail-page preparation.
 * Technical route identifiers remain separate from display names.
 */
export interface ProjectDefinition {
  slug: string;
  name: string;
  description: string;
  preTitle: string;
  primaryTools: string;
  image: string;
  imageAlt: string;
  cardTitle: string;
  cardLinkLabel: string;
}

export const PROJECTS = {
  "hair-log": {
    slug: "hair-log",
    name: "Hair Care Log",
    description: "An Apple Shortcuts system that records hair-care activity in Notion, uses Apple Calendar as part of the surrounding workflow, and retrieves prior entries through the Notion API.",
    preTitle: "Personal workflow automation · 18-Shortcut system",
    primaryTools: "Apple Shortcuts · Notion API · Structured records",
    image: "/assets/hair-care-log.png",
    imageAlt: "Transparent illustration of a hair-care journal with curl-pattern markers and progress tracking",
    cardTitle: "A better memory for hair-care decisions.",
    cardLinkLabel: "Explore Hair Care Log ↗",
  },
  "75-hard-automation": {
    slug: "75-hard-automation",
    name: "75 Days of Discipline",
    description: "A practical accountability system I built to help me show up every day, track the work, and see whether my consistency was actually adding up.",
    preTitle: "Personal accountability system · 75 Soft challenge",
    primaryTools: "Apple Shortcuts · Notion API · Daily accountability",
    image: "/assets/75-hard-calendar.png",
    imageAlt: "Illustration of a calendar with daily completion check marks and progress markers",
    cardTitle: "Practice discipline one day at a time.",
    cardLinkLabel: "Explore 75 Days of Discipline ↗",
  },
  auralogbook: {
    slug: "auralogbook",
    name: "Aura Logbook",
    description: "A mood-reflection journal shaped around the way you make meaning.",
    preTitle: "Full-stack application · In development",
    primaryTools: "React · TypeScript · .NET · MUI · Redux",
    image: "/assets/aura-logbook.png",
    imageAlt: "Transparent illustration of an open reflection journal surrounded by mood markers and a soft aura",
    cardTitle: "A mood logbook, built across the stack.",
    cardLinkLabel: "Explore Aura Logbook ↗",
  },
  "apple-ecosystem": {
    slug: "apple-ecosystem",
    name: "Apple-native operating system",
    description: "Redesigning a mixed productivity setup into a coordinated Apple-native system for knowledge, data, tasks, and automation.",
    preTitle: "Independent systems design · Evolving system",
    primaryTools: "Information architecture · Migration · Numbers · Shortcuts",
    image: "/assets/apple-native-system.png",
    imageAlt: "Transparent illustration of connected phone, notes, calendar, and folder tools organized around a central hub",
    cardTitle: "A place for everything. A purpose for every tool.",
    cardLinkLabel: "Explore Apple-native operating system ↗",
  },
  "dynamic-folder-structures": {
    slug: "dynamic-folder-structures",
    name: "Dynamic folder structures",
    description: "An interactive Apple Shortcut that creates a parent folder and a user-defined set of subfolders.",
    preTitle: "Automation & technical guide · 2024",
    primaryTools: "Apple Shortcuts · Variables · Loops · File paths",
    image: "/assets/dynamic-folder-structures.png",
    imageAlt: "Transparent illustration of an automated parent folder branching into four organized subfolders",
    cardTitle: "Less folder setup. More actual work.",
    cardLinkLabel: "Explore Dynamic folder structures ↗",
  },
  "notion-api-shortcuts": {
    slug: "notion-api-shortcuts",
    name: "Notion API integration",
    description: "Reducing repetitive setup for service-account pages and databases in Notion—while keeping the custom icons, banners, and structure I wanted.",
    preTitle: "API integration · Documented in 2024",
    primaryTools: "REST APIs · JSON · Dictionaries · Technical documentation",
    image: "/assets/notion-api-integration.png",
    imageAlt: "Transparent illustration of structured database records connected through an API bridge",
    cardTitle: "Custom setup, without the repetitive setup.",
    cardLinkLabel: "Explore Notion API integration ↗",
  },
} satisfies Record<string, ProjectDefinition>;

/** Ordered featured-project selection for the home page. */
export const HOME_PROJECT_SLUGS = [
  "auralogbook",
  "75-hard-automation",
  "apple-ecosystem",
] as const;

/** Renders the static fallback card used while preparing generated pages. */
export function renderProjectCard(project: ProjectDefinition) {
  return `<article class="project"><a href="/portfolio/projects/${project.slug}/" class="project-visual" tabindex="-1" aria-hidden="true"><img src="${project.image}" alt="" loading="lazy"></a><div class="project-meta">${project.preTitle}</div><h3>${project.cardTitle}</h3><p>${project.description}</p><div class="tags">${project.primaryTools}</div><a class="worklink" href="/portfolio/projects/${project.slug}/">${project.cardLinkLabel}</a></article>`;
}

/** Applies the same catalog values to a generated project detail page. */
export function applyProjectPageMetadata(html: string, project: ProjectDefinition) {
  return html
    .replace(/(<title>)[^<]+( · Diamond Brown<\/title>)/, `$1${project.name}$2`)
    .replace(/(<span aria-current="page">)[^<]+(<\/span>)/, `$1${project.name}$2`)
    .replace(/(<div class="eyebrow">)[^<]+(<\/div>)/, `$1${project.preTitle}$2`)
    .replace(/(<h1>)[^<]+(<\/h1>)/, `$1${project.name}$2`)
    .replace(/(<p class="lead">)[^<]+(<\/p>)/, `$1${project.description}$2`)
    .replace(/<span>Independent work<\/span>/, project.slug === "75-hard-automation" ? "<span>Independent project</span>" : "<span>Independent work</span>")
    .replace(/<span>[^<]*Apple Shortcuts[^<]*<\/span>/, project.slug === "75-hard-automation"
      ? `<div data-dependency-group="disciplineHighlights"></div>`
      : `<span>${project.primaryTools}</span>`)
    .replace(/<div class="case-banner-media">[\s\S]*?<\/div>/, `<div class="case-banner-media"><img src="${project.image}" alt="${project.imageAlt}" width="330" height="330"></div>`)
    .replace(/(<div class="case-banner">[\s\S]*?)<img src="[^"]+"[^>]*>(<\/div>)/, `$1<img src="${project.image}" alt="${project.imageAlt}" width="330" height="330">$2`);
}
