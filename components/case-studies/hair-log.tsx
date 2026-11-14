import { hairLogContent } from "../../content/case-studies/hair-log.ts";
import { CaseStudyArticle } from "./content-blocks.tsx";
import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the hair-log case study. All page text comes from
 * content/case-studies/hair-log.ts; hero fields come from the project catalog.
 */
export function HairLogCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description={hairLogContent.description}>
      <div className="wrap">
        <CaseStudyHero project={project} breadcrumb="short" />
        <CaseStudyArticle sections={hairLogContent.sections}>
          <ProjectSequenceNav projects={projects} slug="hair-log" next="75-hard-automation" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
