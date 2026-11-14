import type { ComponentType } from "react";
import type { CaseStudyProps } from "./case-study-shell.tsx";
import { AppleEcosystemCaseStudy } from "./apple-ecosystem.tsx";
import { AuralogbookCaseStudy } from "./auralogbook.tsx";
import { DevWikiCaseStudy } from "./dev-wiki.tsx";
import { DynamicFolderStructuresCaseStudy } from "./dynamic-folder-structures.tsx";
import { HairLogCaseStudy } from "./hair-log.tsx";
import { NotionApiShortcutsCaseStudy } from "./notion-api-shortcuts.tsx";
import { SeventyFiveHardAutomationCaseStudy } from "./75-hard-automation.tsx";

/**
 * Case study page components keyed by catalog slug. Each entry is served at
 * `/portfolio/projects/<slug>/`; scripts/prepare-pages.mjs fails the build if a
 * slug here has no catalog project.
 */
export const CASE_STUDIES: Record<string, ComponentType<CaseStudyProps>> = {
  "dev-wiki": DevWikiCaseStudy,
  auralogbook: AuralogbookCaseStudy,
  "notion-api-shortcuts": NotionApiShortcutsCaseStudy,
  "75-hard-automation": SeventyFiveHardAutomationCaseStudy,
  "hair-log": HairLogCaseStudy,
  "dynamic-folder-structures": DynamicFolderStructuresCaseStudy,
  "apple-ecosystem": AppleEcosystemCaseStudy,
};
