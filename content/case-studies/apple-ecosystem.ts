import type { CaseStudyContent } from "./types.ts";

/**
 * Words on the apple-ecosystem case study (/portfolio/projects/apple-ecosystem/).
 * Edit text here; layout lives in components/case-studies/apple-ecosystem.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url "new-tab").
 */
export const appleEcosystemContent: CaseStudyContent = {
  description: "Redesigning a mixed productivity setup into a coordinated Apple-native system for knowledge, data, tasks, and automation.",
  sections: [
    {
      id: "problem",
      nav: "The system behind everyday work",
      title: "The system behind everyday work",
      blocks: [
        "Information was distributed across overlapping productivity tools. Moving to Apple required more than copying notes: the system needed clear ownership for knowledge, structured data, files, tasks, and schedules.",
        "**My contribution:** workflow analysis, architecture, registries, standards, migration, reusable templates, and automation.",
      ],
    },
    {
      id: "architecture",
      nav: "Give every tool a defined role",
      title: "Give every tool a defined role",
      blocks: [
        {
          type: "table",
          caption: "Apple-native system responsibilities",
          columns: ["Tool", "Responsibility"],
          rows: [
            ["Apple Notes", "Knowledge, reference material, and the Guide to GEM Life"],
            ["Numbers", "Registries, structured records, expenses, and dashboards"],
            ["Reminders", "Tasks, recurring routines, and work queues"],
            ["Calendar", "Time-based commitments and scheduling"],
            ["Shortcuts & Siri", "Structured capture, retrieval, and repeatable automation"],
            ["Freeform & iCloud", "Visual exploration and file storage"],
          ],
        },
        { type: "heading", level: 3, text: "Separate content from metadata" },
        "The Manual Registry uses stable identifiers, parent-child relationships, record types, navigation references, and statuses. The Tag Registry defines controlled names and classes. This makes the structure explicit instead of leaving it buried in individual notes.",
      ],
    },
    {
      id: "decisions",
      nav: "Design decisions that mattered",
      title: "Design decisions that mattered",
      blocks: [
        {
          type: "list",
          items: [
            "**Choose tools by responsibility:** use structured tables for data and notes for reference content.",
            "**Preserve meaning during migration:** account for relationships, metadata, and navigation alongside text.",
            "**Standardize recurring work:** use templates, naming conventions, controlled fields, and reusable documentation.",
            "**Automate after understanding:** make the workflow visible before adding another shortcut.",
          ],
        },
        "The expense-tracking portion uses XLOOKUP, COUNTIFS, pivot tables, and monthly snapshots. Dictionary-based Shortcuts support structured personal-reference retrieval.",
      ],
    },
    {
      id: "evidence",
      nav: "Evidence & continued refinement",
      title: "Evidence & continued refinement",
      blocks: [
        "This overview is grounded in my documented independent systems work. Redacted registry samples and a guided system walkthrough are not yet published.",
        "Useful next artifacts are a before/after architecture map, a sample parent-child registry, and one task traced from capture through retrieval. Scaffolding Shortcuts will be described in detail after their implementation is reviewed.",
        {
          type: "note",
          blocks: [
            "**An evolving system.** The aim is maintainability and practical use; no measured productivity or subscription-savings figure is claimed here.",
          ],
        },
      ],
    },
  ],
};
