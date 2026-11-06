// Intentional: use browser navigation because client-side route transitions are failing.
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";
import {
  PROJECTS,
  type ProjectDefinition,
} from "@/scripts/project-catalog.mts";

/**
 * Renders one project card from the shared project catalog.
 *
 * Card copy, imagery, tools, and destination are supplied by the same
 * ProjectDefinition used to prepare the matching detail page. Native anchors
 * keep project navigation available when client-side routing is unavailable.
 */
export function ProjectCard({ project }: { project: ProjectDefinition }) {
  return (
    <article className="project">
      <a
        href={`/portfolio/projects/${project.slug}/`}
        className="project-visual"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={project.image}
          alt=""
          width={800}
          height={520}
          loading="lazy"
        />
      </a>
      <div className="project-meta">{project.preTitle}</div>
      <h3>{project.cardTitle}</h3>
      <p>{project.description}</p>
      <div className="tags">{project.primaryTools}</div>
      <a className="worklink" href={`/portfolio/projects/${project.slug}/`}>
        {project.cardLinkLabel}
      </a>
    </article>
  );
}

/** Renders the complete catalog as the shared project-card grid. */
export function ProjectCardGrid({ slugs, showMoreLink = false }: { slugs?: string[]; showMoreLink?: boolean }) {
  const projects = slugs
    ? slugs.map((slug) => PROJECTS[slug as keyof typeof PROJECTS]).filter(Boolean)
    : Object.values(PROJECTS);

  return (
    <>
      <div className="wrap projects">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
      </div>
      {showMoreLink && (
        <div className="wrap project-grid-actions">
          <a className="button secondary" href="/portfolio/projects/">
            Explore more projects ↗
          </a>
        </div>
      )}
    </>
  );
}
