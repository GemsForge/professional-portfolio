import Image from "next/image";
import Link from "next/link";
import {
  PROJECTS,
  type ProjectDefinition,
} from "@/scripts/project-catalog.mts";

/**
 * Renders one project card from the shared project catalog.
 *
 * Card copy, imagery, tools, and destination are supplied by the same
 * ProjectDefinition used to prepare the matching detail page.
 */
export function ProjectCard({ project }: { project: ProjectDefinition }) {
  return (
    <article className="project">
      <Link
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
      </Link>
      <div className="project-meta">{project.preTitle}</div>
      <h3>{project.cardTitle}</h3>
      <p>{project.description}</p>
      <div className="tags">{project.primaryTools}</div>
      <Link className="worklink" href={`/portfolio/projects/${project.slug}/`}>
        {project.cardLinkLabel}
      </Link>
    </article>
  );
}

/** Renders the complete catalog as the shared project-card grid. */
export function ProjectCardGrid() {
  return (
    <div className="wrap projects">
      {Object.values(PROJECTS).map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
