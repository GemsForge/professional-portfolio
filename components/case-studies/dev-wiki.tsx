import { devWikiContent } from "../../content/case-studies/dev-wiki.ts";
import { CaseStudyArticle } from "./content-blocks.tsx";
import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the dev-wiki case study. All page text comes from
 * content/case-studies/dev-wiki.ts; hero fields come from the project catalog.
 */
export function DevWikiCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description={devWikiContent.description}>
      <div className="wrap">
        <CaseStudyHero project={project} />
        <CaseStudyArticle sections={devWikiContent.sections}>
          <ProjectSequenceNav projects={projects} slug="dev-wiki" next="notion-api-shortcuts" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
