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
  role?: string;
  decisions: string[];
  evidence?: string;
  tools: string[];
  caseStudy?: string;
  source?: string;
  /** Technology groups optionally link to a related project story when one is relevant. */
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
    role: "Build the React and TypeScript app alongside its .NET API.",
    decisions: ["Keep entries to a date, moods, and an optional note.", "Separate the interface, API, authentication, and data sources."],
    evidence: "Architecture, schemas, source, and tests are documented; the app is in development.",
    tools: ["React", "TypeScript", ".NET", "MUI", "Redux Toolkit", "REST API"], caseStudy: "/portfolio/projects/auralogbook/", source: "https://github.com/GemsForge/aura-logbook-api",
    walkthrough: [
      { title: "Check in", detail: "Sign in and start a focused mood entry.", hotspot: { x: 48, y: 42, label: "Mood check-in" } },
      { title: "Capture context", detail: "Choose a date and moods; add an optional note.", hotspot: { x: 66, y: 58, label: "Entry context" } },
      { title: "Review patterns", detail: "Explore history and dashboard summaries in this concept flow.", hotspot: { x: 38, y: 68, label: "Reflection history" } },
    ],
  },
  {
    slug: "notion-api-shortcuts", title: "Notion API Integrations", category: "project", eyebrow: "API integration · Documented in 2024",
    caption: "Reusable Shortcuts turned repeated Notion setup into a modular API toolkit.", image: "/assets/notion-api-integration.png", imageAlt: "Database records connected through an API bridge",
    role: "Designed and built reusable Apple Shortcuts for Notion API workflows.",
    decisions: ["Separate link intake, authentication, formatting, and API actions.", "Document parsing assumptions and credential boundaries."],
    evidence: "14 Shortcuts and sample payloads are documented; current API behavior needs retesting.",
    tools: ["Apple Shortcuts", "Notion API", "REST", "JSON", "Technical documentation"], caseStudy: "/portfolio/projects/notion-api-shortcuts/",
    walkthrough: [
      { title: "Start with a link", detail: "Pass a Notion page or database link to the Shortcut.", hotspot: { x: 42, y: 28, label: "Link intake" } },
      { title: "Prepare the request", detail: "Extract the target ID and prepare authentication.", hotspot: { x: 60, y: 48, label: "Target and auth" } },
      { title: "Map the properties", detail: "Format typed values before sending the API request.", hotspot: { x: 47, y: 71, label: "Property mapping" } },
    ],
  },
  {
    slug: "portfolio-direction", title: "Portfolio Creative Direction", category: "process", eyebrow: "Creative direction · Portfolio system",
    caption: "A portfolio can feel like a social feed and still read like thoughtful engineering work.", image: "/assets/profile-photo.jpg", imageAlt: "Diamond Brown, software engineer and GemsForge founder",
    role: "Shaped the portfolio direction, structure, and front-end implementation.",
    decisions: ["Use a familiar three-column creator grid to browse work.", "Pair the field-journal look with concise evidence and guided prototypes."],
    evidence: "Uses real project artifacts and labels prototypes clearly; social cues are decorative.",
    tools: ["HTML", "CSS", "TypeScript catalog", "Static generation", "Accessible interaction"],
    walkthrough: [
      { title: "Set the profile", detail: "Show role, location, work, and contact at a glance.", hotspot: { x: 45, y: 28, label: "Creator profile" } },
      { title: "Browse the grid", detail: "Square tiles make projects and process easy to scan.", hotspot: { x: 52, y: 52, label: "Post grid" } },
      { title: "Open a story", detail: "Explore decisions and a guided prototype in place.", hotspot: { x: 68, y: 72, label: "Post view" } },
    ],
  },
  {
    slug: "tech-stack", title: "Tech Stack", category: "tech-stack", eyebrow: "Professional & personal · 4 years",
    caption: "The tools I’ve worked with professionally and in personal projects over the past four years.", image: "/assets/auralogbook-stack/react.png", imageAlt: "React logo, one of the technologies in Diamond’s professional and personal project stack",
    decisions: [],
    tools: ["C#", ".NET", "React", "TypeScript", "Redux", "PostgreSQL", "Java", "Notion"],
    stackGroups: [
      { label: "Languages & frameworks", items: [{ label: "C# / .NET", postSlug: "auralogbook" }, { label: "React", postSlug: "auralogbook" }, { label: "TypeScript", postSlug: "auralogbook" }, { label: "Redux", postSlug: "auralogbook" }, { label: "Java" }] },
      { label: "Data & APIs", items: [{ label: "PostgreSQL" }, { label: "REST APIs", postSlug: "notion-api-shortcuts" }, { label: "SQL" }, { label: "JSON", postSlug: "notion-api-shortcuts" }] },
      { label: "Personal projects & tools", items: [{ label: "Notion", postSlug: "notion-api-shortcuts" }, { label: "Apple Shortcuts", postSlug: "hair-log" }, { label: "MUI", postSlug: "auralogbook" }] },
    ],
  },
  {
    slug: "hair-log", title: "Hair Care Log", category: "project", eyebrow: "Personal workflow automation · 18 Shortcuts",
    caption: "A structured memory for hair-care decisions, products, routines, and results.", image: "/assets/hair-care-log.png", imageAlt: "Hair-care journal illustration with routine and progress markers",
    role: "Mapped the workflow and built modular Shortcuts with Notion integration.",
    decisions: ["Store recurring care activities as structured records.", "Use Shortcuts to capture and retrieve connected notes."],
    evidence: "The case study documents 18 Shortcuts, Notion records, and Calendar context.",
    tools: ["Apple Shortcuts", "Notion API", "Apple Calendar", "Structured records"], caseStudy: "/portfolio/projects/hair-log/",
    walkthrough: [
      { title: "Choose an activity", detail: "Start with the care action or observation.", hotspot: { x: 48, y: 31, label: "Activity" } },
      { title: "Add context", detail: "Connect products, styles, conditions, and outcomes.", hotspot: { x: 58, y: 52, label: "Record context" } },
      { title: "Review history", detail: "Use Notion records to revisit earlier entries.", hotspot: { x: 43, y: 72, label: "History" } },
    ],
  },
  {
    slug: "75-hard-automation", title: "75 Days of Discipline", category: "project", eyebrow: "Personal accountability system · 75 Soft",
    caption: "An accountability workflow that makes a repeated daily check-in easier to follow.", image: "/assets/75-hard-calendar.png", imageAlt: "Calendar illustration with daily check marks",
    role: "Designed the daily workflow and built its Apple Shortcuts.",
    decisions: ["Separate prompts, API helpers, and request logic across 13 Shortcuts.", "Use clear completion signals and defined Notion actions."],
    evidence: "Shortcut files support the described flow; no outcome metrics are claimed.",
    tools: ["Apple Shortcuts", "Notion API", "Date context", "Workflow design"], caseStudy: "/portfolio/projects/75-hard-automation/",
    walkthrough: [
      { title: "Check in", detail: "Capture the date and daily activity.", hotspot: { x: 40, y: 28, label: "Daily entry" } },
      { title: "Reuse workflow steps", detail: "Helpers manage prompts, requests, and Notion actions.", hotspot: { x: 62, y: 48, label: "Workflow helpers" } },
      { title: "Record completion", detail: "Return a clear signal for later review.", hotspot: { x: 50, y: 70, label: "Completion record" } },
    ],
  },
  {
    slug: "apple-ecosystem", title: "Apple-native Operating System", category: "project", eyebrow: "Independent systems design · Evolving",
    caption: "Give each tool a clear responsibility so information can move through the system.", image: "/assets/apple-native-system.png", imageAlt: "Connected Apple tools organized around a central system hub",
    role: "Mapped tool responsibilities, data, migration, and automation.",
    decisions: ["Give notes, records, tasks, and automation distinct roles.", "Preserve relationships and metadata during migration."],
    evidence: "The case study documents the system map; sample registries are not published.",
    tools: ["Information architecture", "Migration", "Apple Notes", "Numbers", "Reminders", "Shortcuts"], caseStudy: "/portfolio/projects/apple-ecosystem/",
    walkthrough: [
      { title: "Find overlap", detail: "Identify tools doing similar jobs.", hotspot: { x: 48, y: 28, label: "Current landscape" } },
      { title: "Set tool roles", detail: "Separate notes, records, tasks, and automation.", hotspot: { x: 62, y: 49, label: "Tool responsibilities" } },
      { title: "Plan migration", detail: "Carry relationships and metadata with the content.", hotspot: { x: 43, y: 73, label: "Migration plan" } },
    ],
  },
  {
    slug: "dynamic-folder-structures", title: "Dynamic Folder Structures", category: "project", eyebrow: "Automation & technical guide · 2024",
    caption: "Create a parent folder and user-defined subfolders from a repeatable Shortcut flow.", image: "/assets/dynamic-folder-structures.png", imageAlt: "A parent folder branching into four organized subfolders",
    role: "Designed the Shortcut flow and wrote its implementation guide.",
    decisions: ["Reuse the parent folder reference for each child.", "Use the requested count to control the repeat step."],
    evidence: "The guide documents the flow and labels sample output as illustrative.",
    tools: ["Apple Shortcuts", "Variables", "Repeat control flow", "File paths"], caseStudy: "/portfolio/projects/dynamic-folder-structures/",
    walkthrough: [
      { title: "Name the parent", detail: "Create and store the parent folder.", hotspot: { x: 40, y: 28, label: "Parent folder" } },
      { title: "Choose a count", detail: "Set how many subfolders to create.", hotspot: { x: 60, y: 49, label: "Repeat count" } },
      { title: "Create child folders", detail: "Add each new folder under the stored parent.", hotspot: { x: 50, y: 72, label: "Nested folders" } },
    ],
  },
  {
    slug: "project-management", title: "Make the work legible", category: "process", eyebrow: "Project management · Scope to evidence",
    caption: "Turn a broad idea into a sequence people can understand, contribute to, and review.", image: "/assets/collaboration.png", imageAlt: "Three people assembling pieces of a shared system",
    role: "Plan scope, dependencies, implementation, and verification.",
    decisions: ["Define the user outcome and acceptance criteria first.", "Track risks, dependencies, and evidence as work progresses.", "Keep the next decision and owner visible."],
    evidence: "Project stories show the approach; this post makes no delivery-metric claims.",
    tools: ["Scope definition", "Acceptance criteria", "Issue tracking", "Dependency mapping", "Verification planning"],
    walkthrough: [
      { title: "Name the outcome", detail: "State who the work serves and what changes.", hotspot: { x: 50, y: 28, label: "User outcome" } },
      { title: "Set the scope", detail: "List deliverables, non-goals, dependencies, and risks.", hotspot: { x: 34, y: 53, label: "Scope and dependencies" } },
      { title: "Check with evidence", detail: "Choose verification before implementation begins.", hotspot: { x: 67, y: 75, label: "Verification" } },
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
