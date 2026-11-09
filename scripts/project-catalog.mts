import { siApple, siDotnet, siMui, siNotion, siReact, siRedux, siTypescript } from "simple-icons";

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
  /** Link copy omits decorative punctuation, which is supplied by the shared card style. */
  cardLinkLabel: string;
  /** Technology labels receive a recognizable Simple Icons mark when available. */
  technologies: { label: string; icon?: string }[];
}

/** Content and evidence used by the one-page creator profile and its post viewer. */
export interface PortfolioPostDefinition {
  slug: string;
  title: string;
  category: "project" | "process" | "tech-stack";
  eyebrow: string;
  caption: string;
  image: string;
  imageAlt: string;
  role: string;
  decisions: string[];
  evidence: string;
  tools: string[];
  caseStudy?: string;
  source?: string;
  /** Technology groups link each item to the project post that demonstrates it. */
  stackGroups?: { label: string; items: { label: string; postSlug?: string; href?: string }[] }[];
  /** Each step narrates a documented interaction; it does not claim a live application. */
  walkthrough?: { title: string; detail: string; hotspot: { x: number; y: number; label: string } }[];
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
    cardLinkLabel: "Explore Hair Care Log",
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
    cardLinkLabel: "Explore 75 Days of Discipline",
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
    cardLinkLabel: "Explore Aura Logbook",
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
    cardLinkLabel: "Explore Apple-native operating system",
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
    cardLinkLabel: "Explore Dynamic folder structures",
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
    cardLinkLabel: "Explore Notion API integration",
    technologies: [{ label: "REST APIs" }, { label: "JSON" }, { label: "Dictionaries" }, { label: "Technical documentation" }],
  },
} satisfies Record<string, ProjectDefinition>;

/** Ordered featured-project selection for the home page. */
export const HOME_PROJECT_SLUGS = [
  "auralogbook",
  "75-hard-automation",
  "apple-ecosystem",
] as const;

/**
 * Curated posts define both the visible profile grid and same-page post views.
 * The first three entries preserve the requested opening row; Tech Stack leads row two.
 */
export const PORTFOLIO_POSTS: PortfolioPostDefinition[] = [
  {
    slug: "auralogbook", title: "Aura Logbook", category: "project", eyebrow: "Full-stack application · In development",
    caption: "A mood-reflection journal shaped around the way you make meaning.", image: "/assets/aura-logbook.png", imageAlt: "Open reflection journal with mood markers",
    role: "Full-stack development across the React and TypeScript interface and the .NET API.",
    decisions: ["Keep the check-in focused on a date, moods, and an optional note.", "Separate the front end, API responsibilities, authentication, and data sources."],
    evidence: "The project includes documented architecture, schemas, source links, and test coverage. It is in development; storage and API limits are documented in the case study.",
    tools: ["React", "TypeScript", ".NET", "MUI", "Redux Toolkit", "REST API"], caseStudy: "/portfolio/projects/auralogbook/", source: "https://github.com/GemsForge/aura-logbook-api",
    walkthrough: [
      { title: "Check in", detail: "The documented journey starts with an authenticated account and a focused mood entry.", hotspot: { x: 48, y: 42, label: "Mood check-in" } },
      { title: "Capture context", detail: "A date, one or more moods, and an optional comment keep the entry structured without forcing a long journal entry.", hotspot: { x: 66, y: 58, label: "Entry context" } },
      { title: "Review patterns", detail: "The case study describes date-range history and dashboard summaries. This walkthrough illustrates the documented product flow; it is not a live app demo.", hotspot: { x: 38, y: 68, label: "Reflection history" } },
    ],
  },
  {
    slug: "notion-api-shortcuts", title: "Notion API Integrations", category: "project", eyebrow: "API integration · Documented in 2024",
    caption: "Reusable Shortcuts turned repeated Notion setup into a modular API toolkit.", image: "/assets/notion-api-integration.png", imageAlt: "Database records connected through an API bridge",
    role: "Workflow designer and implementer of a documented set of Apple Shortcuts integrations.",
    decisions: ["Split URL intake, authentication preparation, typed property formatting, and higher-level API operations.", "Document workspace-specific parsing assumptions and credential boundaries."],
    evidence: "The case study documents 14 Shortcuts and example payloads. The historical setup has not been retested against current Notion API behavior.",
    tools: ["Apple Shortcuts", "Notion API", "REST", "JSON", "Technical documentation"], caseStudy: "/portfolio/projects/notion-api-shortcuts/",
    walkthrough: [
      { title: "Start from a shared link", detail: "The documented intake shortcut accepts a Notion page or database link from the Share Sheet.", hotspot: { x: 42, y: 28, label: "Link intake" } },
      { title: "Prepare the target", detail: "Parsing extracts the identifier; a shared helper prepares authentication for the higher-level operation.", hotspot: { x: 60, y: 48, label: "Target and auth" } },
      { title: "Build a typed request", detail: "Reusable formatters assemble text, select, multi-select, and relation properties before the documented API request.", hotspot: { x: 47, y: 71, label: "Property mapping" } },
    ],
  },
  {
    slug: "portfolio-direction", title: "Portfolio Creative Direction", category: "process", eyebrow: "Creative direction · Portfolio system",
    caption: "A portfolio can feel like a social feed and still read like thoughtful engineering work.", image: "/assets/profile-photo.jpg", imageAlt: "Diamond Brown, software engineer and GemsForge founder",
    role: "Creative direction, information architecture, and front-end implementation for this portfolio experience.",
    decisions: ["Use a familiar three-column creator grid as the navigation surface.", "Pair the tactile field-journal palette with compact evidence-led post narratives and guided prototypes."],
    evidence: "The layout uses the existing forest-green identity, real project artifacts, and explicit prototype labels. Social-style glyphs are decorative, noninteractive details; no engagement counts are invented.",
    tools: ["HTML", "CSS", "TypeScript catalog", "Static generation", "Accessible interaction"],
    walkthrough: [
      { title: "Set the point of view", detail: "A compact profile quickly gives hiring teams the role, location, work links, and contact path.", hotspot: { x: 45, y: 28, label: "Creator profile" } },
      { title: "Make the grid the index", detail: "Square image-led tiles make projects, process, and technical evidence scannable at a glance.", hotspot: { x: 52, y: 52, label: "Post grid" } },
      { title: "Open the evidence", detail: "A same-page post view carries decisions and prototype walkthroughs without losing the visitor's place in the feed.", hotspot: { x: 68, y: 72, label: "Post view" } },
    ],
  },
  {
    slug: "tech-stack", title: "Tech Stack", category: "tech-stack", eyebrow: "Tools in context · No proficiency scores",
    caption: "Technologies shown beside the projects and responsibilities where they appear.", image: "/assets/auralogbook-stack/react.png", imageAlt: "React mark, representing technologies used across documented projects",
    role: "Full-stack engineer working across interface development, API integration, automation, and technical documentation.",
    decisions: ["Group tools by the kind of work they support.", "Link each group to documented project evidence instead of assigning unsupported ratings."],
    evidence: "React, TypeScript, C#/.NET, REST APIs, SQL, QA automation, systems analysis, and Java/Spring Boot apprenticeship training are described in the existing portfolio materials.",
    tools: ["React", "TypeScript", "C#/.NET", "REST APIs", "SQL", "QA automation", "Systems analysis", "Java / Spring Boot"],
    stackGroups: [
      { label: "Interface & application", items: [{ label: "React", postSlug: "auralogbook" }, { label: "TypeScript", postSlug: "auralogbook" }, { label: "MUI", postSlug: "auralogbook" }, { label: "Redux Toolkit", postSlug: "auralogbook" }] },
      { label: "API & data", items: [{ label: "C# / .NET", postSlug: "auralogbook" }, { label: "REST APIs", postSlug: "notion-api-shortcuts" }, { label: "SQL (declared dependency)", postSlug: "auralogbook" }] },
      { label: "Workflow & systems", items: [{ label: "Apple Shortcuts", postSlug: "hair-log" }, { label: "Notion API", postSlug: "notion-api-shortcuts" }, { label: "Systems analysis", postSlug: "apple-ecosystem" }] },
      { label: "Quality & learning", items: [{ label: "QA automation", postSlug: "auralogbook" }, { label: "Java / Spring Boot training", href: "/about/" }] },
    ],
  },
  {
    slug: "hair-log", title: "Hair Care Log", category: "project", eyebrow: "Personal workflow automation · 18 Shortcuts",
    caption: "A structured memory for hair-care decisions, products, routines, and results.", image: "/assets/hair-care-log.png", imageAlt: "Hair-care journal illustration with routine and progress markers",
    role: "Workflow analysis, modular Shortcut design, Notion database integration, and technical documentation.",
    decisions: ["Represent recurring care activities as structured records.", "Use modular Shortcuts to collect, retrieve, and connect notes to the Notion database."],
    evidence: "The case study documents an 18-Shortcut system, Notion records, Apple Calendar context, and evidence limits.",
    tools: ["Apple Shortcuts", "Notion API", "Apple Calendar", "Structured records"], caseStudy: "/portfolio/projects/hair-log/",
    walkthrough: [
      { title: "Choose an activity", detail: "A modular Shortcut begins with the care action or observation to capture.", hotspot: { x: 48, y: 31, label: "Activity" } },
      { title: "Add useful context", detail: "The documented record structure connects activities, products, styles, conditions, and outcomes.", hotspot: { x: 58, y: 52, label: "Record context" } },
      { title: "Retrieve the history", detail: "Notion provides the structured history for later review. This is a workflow illustration, not a runnable Shortcut.", hotspot: { x: 43, y: 72, label: "History" } },
    ],
  },
  {
    slug: "75-hard-automation", title: "75 Days of Discipline", category: "project", eyebrow: "Personal accountability system · 75 Soft",
    caption: "An accountability workflow that makes a repeated daily check-in easier to follow.", image: "/assets/75-hard-calendar.png", imageAlt: "Calendar illustration with daily check marks",
    role: "Workflow designer and Shortcut implementer for a documented daily accountability system.",
    decisions: ["Separate entry points, prompts, API helpers, and request logic across 13 Shortcuts.", "Use consistent completion signals and keep Notion tool responsibilities explicit."],
    evidence: "The Shortcut folder and editor review support the described names and behavior. The portfolio makes no measured adherence or time-saving claim.",
    tools: ["Apple Shortcuts", "Notion API", "Date context", "Workflow design"], caseStudy: "/portfolio/projects/75-hard-automation/",
    walkthrough: [
      { title: "Begin a daily check-in", detail: "The main flow gathers the date and daily activity context through a Shortcut entry point.", hotspot: { x: 40, y: 28, label: "Daily entry" } },
      { title: "Route reusable steps", detail: "Prompts and helper Shortcuts keep date context, request preparation, and Notion actions modular.", hotspot: { x: 62, y: 48, label: "Workflow helpers" } },
      { title: "Record the result", detail: "The documented system returns a consistent completion signal for later review; no engagement or challenge outcome is inferred.", hotspot: { x: 50, y: 70, label: "Completion record" } },
    ],
  },
  {
    slug: "apple-ecosystem", title: "Apple-native Operating System", category: "project", eyebrow: "Independent systems design · Evolving",
    caption: "Give each tool a clear responsibility so information can move through the system.", image: "/assets/apple-native-system.png", imageAlt: "Connected Apple tools organized around a central system hub",
    role: "Workflow analysis, information architecture, registry design, migration planning, and automation.",
    decisions: ["Assign distinct roles to notes, structured data, tasks, calendars, automation, and storage.", "Preserve relationships and metadata during migration; automate after clarifying the workflow."],
    evidence: "The existing case study describes the tool map and decisions, and explicitly notes that redacted registry samples and a guided system walkthrough are not yet published.",
    tools: ["Information architecture", "Migration", "Apple Notes", "Numbers", "Reminders", "Shortcuts"], caseStudy: "/portfolio/projects/apple-ecosystem/",
    walkthrough: [
      { title: "Find overlapping responsibilities", detail: "The documented work begins with information spread across tools that were doing similar jobs.", hotspot: { x: 48, y: 28, label: "Current landscape" } },
      { title: "Give tools distinct roles", detail: "Notes hold reference knowledge, structured tables hold records, reminders track tasks, and Shortcuts support repeatable capture.", hotspot: { x: 62, y: 49, label: "Tool responsibilities" } },
      { title: "Plan migration around meaning", detail: "Move relationships, metadata, and navigation alongside content. This is a narrated concept flow; a guided system walkthrough is not yet published.", hotspot: { x: 43, y: 73, label: "Migration plan" } },
    ],
  },
  {
    slug: "dynamic-folder-structures", title: "Dynamic Folder Structures", category: "project", eyebrow: "Automation & technical guide · 2024",
    caption: "Create a parent folder and user-defined subfolders from a repeatable Shortcut flow.", image: "/assets/dynamic-folder-structures.png", imageAlt: "A parent folder branching into four organized subfolders",
    role: "Shortcut workflow design, implementation guidance, and technical writing.",
    decisions: ["Keep the created parent-folder reference for each subsequent child folder.", "Use the user-provided count to drive repeat behavior and explain the path dependency."],
    evidence: "The project page documents the expected flow and validation checks, and labels the sample output as illustrative rather than a captured execution.",
    tools: ["Apple Shortcuts", "Variables", "Repeat control flow", "File paths"], caseStudy: "/portfolio/projects/dynamic-folder-structures/",
    walkthrough: [
      { title: "Name the parent", detail: "Collect the parent-folder name and keep its created folder reference for subsequent actions.", hotspot: { x: 40, y: 28, label: "Parent folder" } },
      { title: "Choose the repeat count", detail: "A numeric input determines how many subfolder names the flow will request.", hotspot: { x: 60, y: 49, label: "Repeat count" } },
      { title: "Create children in place", detail: "Each new folder uses the stored parent reference. The pictured tree is expected output, not a captured execution.", hotspot: { x: 50, y: 72, label: "Nested folders" } },
    ],
  },
  {
    slug: "project-management", title: "Make the work legible", category: "process", eyebrow: "Project management · Scope to evidence",
    caption: "Turn a broad idea into a sequence people can understand, contribute to, and review.", image: "/assets/collaboration.png", imageAlt: "Three people assembling pieces of a shared system",
    role: "Project planning and coordination across goals, scope, dependencies, implementation, and verification.",
    decisions: ["Write the intended user outcome and acceptance criteria before implementation.", "Keep risks, dependencies, and evidence expectations visible as work moves forward.", "Make the next decision and owner clear rather than hiding uncertainty in status language."],
    evidence: "This portfolio's project stories and issue-linked implementation workflow provide examples of scoped outcomes, acceptance criteria, and verification expectations. This post describes a working method, not a claimed delivery metric.",
    tools: ["Scope definition", "Acceptance criteria", "Issue tracking", "Dependency mapping", "Verification planning"],
    walkthrough: [
      { title: "Name the outcome", detail: "Describe who the work serves and what should become easier or possible when it is complete.", hotspot: { x: 50, y: 28, label: "User outcome" } },
      { title: "Shape a reviewable scope", detail: "Separate the work into clear deliverables, explicit non-goals, dependencies, and risks.", hotspot: { x: 34, y: 53, label: "Scope and dependencies" } },
      { title: "Close the loop with evidence", detail: "Choose verification expectations before implementation and record what the evidence does—and does not—prove.", hotspot: { x: 67, y: 75, label: "Verification" } },
    ],
  },
];

/** Renders the static fallback card used while preparing generated pages. */
export function renderProjectCard(project: ProjectDefinition) {
  const tags = project.technologies.map(({ label, icon }) => `<span class="tech-chip">${icon ? `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="${iconPath(icon)}"/></svg>` : ""}<span>${label}</span></span>`).join("");
  return `<article class="project"><a href="/portfolio/projects/${project.slug}/" class="project-visual" tabindex="-1" aria-hidden="true"><img src="${project.image}" alt="" loading="lazy"></a><div class="project-meta">${project.preTitle}</div><h3>${project.cardTitle}</h3><p>${project.description}</p><div class="tags" aria-label="Technologies and project themes">${tags}</div><a class="worklink" href="/portfolio/projects/${project.slug}/">${project.cardLinkLabel}</a></article>`;
}

/** Resolves the bundled Simple Icons path used by static project cards. */
function iconPath(icon: string) {
  const icons = { apple: siApple, notion: siNotion, react: siReact, typescript: siTypescript, dotnet: siDotnet, mui: siMui, redux: siRedux };
  return icons[icon as keyof typeof icons]?.path ?? "";
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
