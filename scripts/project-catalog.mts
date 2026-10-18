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
  "75-hard-automation": {
    slug: "75-hard-automation",
    name: "75 Hard automation",
    description: "A daily discipline workflow that gathers completion signals, reflections, exercise, water, faith, and date context, then records the structured result in Notion.",
    preTitle: "Personal accountability automation · 13-Shortcut system",
    primaryTools: "Apple Shortcuts · Notion API · Daily accountability",
    image: "/assets/75-hard-calendar.png",
    imageAlt: "Illustration of a calendar with daily completion check marks and progress markers",
    cardTitle: "Make a demanding daily checklist visible.",
    cardLinkLabel: "Explore 75 Hard automation ↗",
  },
} satisfies Record<string, ProjectDefinition>;

export function renderProjectCard(project: ProjectDefinition) {
  return `<article class="project"><a href="/portfolio/projects/${project.slug}/" class="project-visual" tabindex="-1" aria-hidden="true"><img src="${project.image}" alt="" loading="lazy"></a><div class="project-meta">${project.preTitle}</div><h3>${project.cardTitle}</h3><p>${project.description}</p><div class="tags">${project.primaryTools}</div><a class="worklink" href="/portfolio/projects/${project.slug}/">${project.cardLinkLabel}</a></article>`;
}

export function applyProjectPageMetadata(html: string, project: ProjectDefinition) {
  return html
    .replace(/(<title>)[^<]+( · Diamond Brown<\/title>)/, `$1${project.name}$2`)
    .replace(/(<span aria-current="page">)[^<]+(<\/span>)/, `$1${project.name}$2`)
    .replace(/(<div class="eyebrow">)[^<]+(<\/div>)/, `$1${project.preTitle}$2`)
    .replace(/(<h1>)[^<]+(<\/h1>)/, `$1${project.name}$2`)
    .replace(/(<p class="lead">)[^<]+(<\/p>)/, `$1${project.description}$2`)
    .replace(/<span>[^<]*Apple Shortcuts[^<]*<\/span>/, `<span>${project.primaryTools}</span>`)
    .replace(/<div class="case-banner-media">[\s\S]*?<\/div>/, `<div class="case-banner-media"><img src="${project.image}" alt="${project.imageAlt}" width="330" height="330"></div>`);
}
