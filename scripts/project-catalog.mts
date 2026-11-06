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
  /** Technology labels receive a recognizable Simple Icons mark when available. */
  technologies: { label: string; icon?: string }[];
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
    technologies: [{ label: "Apple Shortcuts", icon: "apple" }, { label: "Notion API", icon: "notion" }, { label: "Structured records" }],
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
    technologies: [{ label: "Apple Shortcuts", icon: "apple" }, { label: "Notion API", icon: "notion" }, { label: "Daily accountability" }],
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
    technologies: [{ label: "React", icon: "react" }, { label: "TypeScript", icon: "typescript" }, { label: ".NET", icon: "dotnet" }, { label: "MUI", icon: "mui" }, { label: "Redux", icon: "redux" }],
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
    technologies: [{ label: "Information architecture" }, { label: "Migration" }, { label: "Numbers" }, { label: "Shortcuts", icon: "apple" }],
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
    technologies: [{ label: "Apple Shortcuts", icon: "apple" }, { label: "Variables" }, { label: "Loops" }, { label: "File paths" }],
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
    technologies: [{ label: "REST APIs" }, { label: "JSON" }, { label: "Dictionaries" }, { label: "Technical documentation" }],
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
  const tags = project.technologies.map(({ label, icon }) => `<span class="tech-chip">${icon ? `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="${iconPath(icon)}"/></svg>` : ""}<span>${label}</span></span>`).join("");
  return `<article class="project"><a href="/portfolio/projects/${project.slug}/" class="project-visual" tabindex="-1" aria-hidden="true"><img src="${project.image}" alt="" loading="lazy"></a><div class="project-meta">${project.preTitle}</div><h3>${project.cardTitle}</h3><p>${project.description}</p><div class="tags" aria-label="Technologies and project themes">${tags}</div><a class="worklink" href="/portfolio/projects/${project.slug}/">${project.cardLinkLabel.replace(/\s*↗$/, "")}</a></article>`;
}

/** Resolves the bundled Simple Icons path used by static project cards. */
function iconPath(icon: string) {
  const paths: Record<string, string> = {
    apple: "M16.365 1.43c0 1.14-.416 2.22-1.244 3.238-.999 1.209-2.207 1.907-3.527 1.8a3.6 3.6 0 0 1-.026-.436c0-1.094.476-2.261 1.32-3.218.421-.485.957-.889 1.609-1.212S15.761.1 16.34 0c.017.144.025.287.025.43zM20.32 17.15c-.49 1.135-.716 1.641-1.34 2.646-.87 1.4-2.096 3.144-3.613 3.158-1.349.013-1.697-.879-3.526-.868-1.829.01-2.213.883-3.562.87-1.518-.015-2.677-1.59-3.548-2.99C2.293 16.495 2.041 12.41 3.453 10.24c1.002-1.542 2.586-2.445 4.075-2.445 1.516 0 2.47.885 3.721.885 1.214 0 1.953-.887 3.703-.887 1.324 0 2.726.72 3.724 1.966-3.273 1.796-2.742 6.465 1.644 7.391z",
    notion: "M4.459 4.208c.25.02.499.057.74.111l10.893 7.093V5.57c-.596-.572-1.365-.96-2.225-1.08-.786-.111-1.575-.184-2.366-.219V2.8h8.998v1.47c-.738.045-1.303.16-1.695.347-.392.187-.642.497-.752.93-.11.433-.165 1.12-.165 2.06v14.2h-1.6L5.33 11.22v7.68c0 .939.052 1.62.157 2.043.105.423.337.73.697.922.36.192.915.316 1.667.372v1.47H.786v-1.47c.72-.06 1.245-.186 1.574-.378.329-.192.54-.498.632-.917.092-.42.138-1.1.138-2.042V7.1c0-.7-.16-1.226-.48-1.579-.32-.352-.866-.568-1.64-.648V3.4c.85.368 2.167.64 3.45.808z",
    react: "M12 10.72a1.28 1.28 0 1 0 0 2.56 1.28 1.28 0 0 0 0-2.56zm0-2.7c2.9 0 5.59.42 7.58 1.12 2.4.84 3.87 2.1 3.87 3.36 0 1.32-1.59 2.67-4.2 3.54-1.94.65-4.5 1-7.25 1-2.82 0-5.45-.37-7.41-1.05C2.08 15.13.55 13.8.55 12.5c0-1.26 1.4-2.5 3.77-3.34C6.33 8.46 9.06 8.02 12 8.02zm-7.66 1.93c-2.2.76-3.1 1.75-3.1 2.55 0 .83.98 1.9 3.2 2.67 1.8.63 4.27.98 6.99.98 2.65 0 5.05-.33 6.83-.93 2.43-.81 3.48-1.9 3.48-2.72 0-.78-.94-1.75-3.1-2.5-1.82-.64-4.4-1.04-7.18-1.04-2.82 0-5.45.41-7.12.99z",
    typescript: "M0 0h24v24H0zM4.8 13.2h4.6v1.6H7.9v5.5H6.2v-5.5H4.8zm6.2 4.7c.5.5 1.2.8 2 .8 1 0 1.6-.4 1.6-1 0-.7-.7-.9-1.7-1.2-1.4-.4-2.7-.9-2.7-2.6 0-1.5 1.2-2.4 3.1-2.4 1.2 0 2.2.3 2.9 1l-.9 1.2c-.6-.5-1.2-.7-2-.7-.8 0-1.3.3-1.3.8 0 .6.6.8 1.7 1.1 1.5.5 2.8 1 2.8 2.7 0 1.6-1.3 2.6-3.4 2.6-1.5 0-2.7-.5-3.5-1.3zm6.9-4.7h4.4v1.6h-1.4v5.5h-1.7v-5.5h-1.3z",
    dotnet: "M24 8.6 17.3 4.7 3.7 12.5v1L17.3 5.7l5.7 3.3v6.1l-5.7 3.3-5.4-3.1v-6L6.4 12v1l4.6-2.7v5.8l6.3 3.7L24 15.9zM0 9.3v7.4l6.4 3.7v-7.5z",
    mui: "M1.2 12 11.5 6v4.1l-6.7 3.9 6.7 3.9v4.1zm10.3-6 10.3 6-3.6 2.1-6.7-3.9zm0 8.1 3.6 2.1 6.7-3.9v4.1l-6.7 3.9-3.6-2.1z",
    redux: "M16.6 16.7c.9-.1 1.6-.8 1.6-1.7 0-1-.8-1.8-1.8-1.8-1 0-1.8.8-1.8 1.8 0 .3.1.6.2.8-1.4.8-3.1 1.1-5 .9-.7-.1-1.4-.3-2-.5 1.1-1.3 2.2-3.1 3.2-5.2.3 0 .5.1.8.1 1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8-1.8.8-1.8 1.8c0 .3.1.6.2.8-1 2-2.1 3.7-3.2 4.9-1.2-.7-2-1.8-2.2-3-.2-1.2.2-2.4 1.2-3.4l-1.2-1.2c-1.4 1.4-2 3.1-1.7 4.9.3 1.6 1.3 3 2.9 4-.1.2-.2.5-.2.7 0 1 .8 1.8 1.8 1.8.8 0 1.4-.5 1.7-1.2 2.4.2 4.5-.3 6.1-1.2.3.3.7.5 1.2.5z",
  };
  return paths[icon] ?? "";
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
