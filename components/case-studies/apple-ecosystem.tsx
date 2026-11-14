import { appleEcosystemContent } from "../../content/case-studies/apple-ecosystem.ts";
import { CaseStudyArticle } from "./content-blocks.tsx";
import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the apple-ecosystem case study. All page text comes from
 * content/case-studies/apple-ecosystem.ts; hero fields come from the project catalog.
 */
export function AppleEcosystemCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description={appleEcosystemContent.description}>
      <div className="wrap">
        <CaseStudyHero project={project} />
        <CaseStudyArticle sections={appleEcosystemContent.sections}>
          <ProjectSequenceNav projects={projects} slug="apple-ecosystem" next="dynamic-folder-structures" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
