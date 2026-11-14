import { dynamicFolderStructuresContent } from "../../content/case-studies/dynamic-folder-structures.ts";
import { CaseStudyArticle } from "./content-blocks.tsx";
import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the dynamic-folder-structures case study. All page text comes from
 * content/case-studies/dynamic-folder-structures.ts; hero fields come from the project catalog.
 */
export function DynamicFolderStructuresCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description={dynamicFolderStructuresContent.description}>
      <div className="wrap">
        <CaseStudyHero project={project} />
        <CaseStudyArticle sections={dynamicFolderStructuresContent.sections}>
          <ProjectSequenceNav projects={projects} slug="dynamic-folder-structures" next="notion-api-shortcuts" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
