import type { ReactNode } from "react";
import type { ProjectDefinition, PROJECTS } from "../../scripts/project-catalog.mts";

/**
 * Shared building blocks for the portfolio case study pages (#132).
 *
 * Case studies are rendered to static HTML at build time by
 * `scripts/render-case-studies.mjs`, then pass through the same shared-shell,
 * social-metadata, and theme transforms as every other generated page. These
 * components therefore emit plain document markup and must not depend on
 * client-side React state.
 *
 * Imports between case study modules use explicit `.tsx` extensions and only
 * type-level imports from outside this folder, because the build transpiles
 * this folder on its own and resolves the emitted relative imports as-is.
 */

/** A catalog project slug; type checking rejects misspelled navigation targets. */
export type ProjectSlug = keyof typeof PROJECTS;

/** Catalog data every case study page receives from scripts/project-catalog.mts. */
export interface CaseStudyProps {
  /** The project this page documents. */
  project: ProjectDefinition;
  /** Every catalog project, keyed by slug, for cross-project navigation labels. */
  projects: Record<string, ProjectDefinition>;
}

interface CaseStudyDocumentProps {
  project: ProjectDefinition;
  /** Search and social preview description for the page. */
  description: string;
  /** Page-specific stylesheets loaded after the base site.css. */
  stylesheets?: string[];
  /** Page-specific deferred scripts loaded from <head>. */
  scripts?: string[];
  /** Overrides the base stylesheet URL, e.g. to add a cache-busting query. */
  siteStylesheet?: string;
  /** Classes for <body>; the build adds the shared `rd` redesign class to every case study. */
  bodyClassName?: string;
  /** Page content rendered inside <main id="main">. */
  children: ReactNode;
}

/**
 * Full HTML document for one case study.
 *
 * The empty <header> and <footer> are placeholders: `applySiteRedesign` swaps
 * them for the shared top bar and footer so navigation cannot drift between
 * pages. The title always comes from the catalog project name; the canonical
 * link is added from the route by `applySocialMetadata` (scripts/site-metadata.mjs).
 */
export function CaseStudyDocument({
  project,
  description,
  stylesheets = [],
  scripts = [],
  siteStylesheet = "/assets/site.css",
  bodyClassName,
  children,
}: CaseStudyDocumentProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content={description} />
        <meta name="theme-color" content="#1e2823" />
        <title>{`${project.name} · Diamond Brown`}</title>
        <link rel="icon" type="image/png" href="/assets/brandmark.png" />
        {[siteStylesheet, ...stylesheets].map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {scripts.map((src) => (
          <script key={src} src={src} defer />
        ))}
      </head>
      <body className={bodyClassName}>
        <a className="skip" href="#main">Skip to content</a>
        <header />
        <main id="main">{children}</main>
        <footer />
        {/* Hydrates the owner-managed image gallery slot rendered by ProjectSequenceNav. */}
        <script src="/assets/gallery.js" defer />
      </body>
    </html>
  );
}

interface CaseStudyHeroProps {
  project: ProjectDefinition;
  /** "full" links Portfolio / Projects; "short" links only Projects. */
  breadcrumb?: "full" | "short";
  /** First fact chip describing who owned the work. */
  ownership?: string;
  /** Second fact chip; defaults to the catalog's primary tools, or a custom node such as a dependency-group slot. */
  tools?: ReactNode;
  /** Wraps the banner image in `.case-banner-media` for illustrations that need a framed backdrop. */
  framedMedia?: boolean;
}

/**
 * Breadcrumb and banner for a standard case study. Name, pre-title,
 * description, and banner image all come from the project catalog, so a
 * catalog edit updates the card and the detail page together.
 */
export function CaseStudyHero({
  project,
  breadcrumb = "full",
  ownership = "Independent work",
  tools = project.primaryTools,
  framedMedia = false,
}: CaseStudyHeroProps) {
  const image = <img src={project.image} alt={project.imageAlt} width="330" height="330" />;
  return (
    <div className="pagehero">
      {breadcrumb === "full" ? (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/portfolio/">Portfolio</a> / <a href="/portfolio/projects/">Projects</a> /{" "}
          <span aria-current="page">{project.name}</span>
        </nav>
      ) : (
        <nav className="breadcrumb">
          <a href="/portfolio/projects/">Projects</a> / <span aria-current="page">{project.name}</span>
        </nav>
      )}
      <div className="case-banner">
        <div>
          <div className="eyebrow">{project.preTitle}</div>
          <h1>{project.name}</h1>
          <p className="lead">{project.description}</p>
          <div className="facts">
            <span>{ownership}</span>
            {typeof tools === "string" ? <span>{tools}</span> : tools}
          </div>
        </div>
        {framedMedia ? <div className="case-banner-media">{image}</div> : image}
      </div>
    </div>
  );
}

interface ProjectSequenceNavProps {
  projects: Record<string, ProjectDefinition>;
  /** Slug of the current page; names its owner-managed gallery slot. */
  slug: string;
  /** Renders "All projects / Next: <name>". */
  next?: ProjectSlug;
  /** Renders "Previous: <name> / All projects" when the page links backwards instead. */
  previous?: ProjectSlug;
}

/**
 * Closing navigation for a case study, preceded by the hidden gallery slot
 * that `/assets/gallery.js` fills with published images for this project.
 * Link labels come from catalog names so renamed projects stay in sync.
 */
export function ProjectSequenceNav({ projects, slug, next, previous }: ProjectSequenceNavProps) {
  const allProjects = "/portfolio/projects/";
  for (const target of [next, previous]) {
    if (target && !projects[target]) throw new Error(`${slug} links to unknown project "${target}".`);
  }
  return (
    <>
      <section data-project-gallery={slug} hidden />
      <nav className="next-project" aria-label="Project navigation">
        {previous ? (
          <>
            <a href={`${allProjects}${previous}/`}>Previous: {projects[previous].name}</a>
            <a href={allProjects}>All projects</a>
          </>
        ) : (
          <>
            <a href={allProjects}>All projects</a>
            {next ? <a href={`${allProjects}${next}/`}>Next: {projects[next].name}</a> : null}
          </>
        )}
      </nav>
    </>
  );
}
