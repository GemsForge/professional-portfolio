import { notionApiShortcutsContent } from "../../content/case-studies/notion-api-shortcuts.ts";
import { CaseStudyArticle } from "./content-blocks.tsx";
import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the notion-api-shortcuts case study. All page text comes from
 * content/case-studies/notion-api-shortcuts.ts; hero fields come from the project catalog.
 */
export function NotionApiShortcutsCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description={notionApiShortcutsContent.description}>
      <div className="wrap">
        <CaseStudyHero project={project} />
        <CaseStudyArticle sections={notionApiShortcutsContent.sections}>
          <ProjectSequenceNav projects={projects} slug="notion-api-shortcuts" next="auralogbook" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
