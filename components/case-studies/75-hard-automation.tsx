import { seventyFiveHardAutomationContent } from "../../content/case-studies/75-hard-automation.ts";
import { CaseStudyArticle } from "./content-blocks.tsx";
import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the 75-hard-automation case study. All page text comes from
 * content/case-studies/75-hard-automation.ts; hero fields come from the project catalog.
 */
export function SeventyFiveHardAutomationCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description={seventyFiveHardAutomationContent.description}>
      <div className="wrap">
        <CaseStudyHero project={project} breadcrumb="short" ownership="Independent project" tools={<div data-dependency-group="disciplineHighlights" />} framedMedia />
        <CaseStudyArticle sections={seventyFiveHardAutomationContent.sections}>
          <ProjectSequenceNav projects={projects} slug="75-hard-automation" previous="hair-log" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
