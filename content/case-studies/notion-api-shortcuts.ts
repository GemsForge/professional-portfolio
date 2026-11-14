import type { CaseStudyContent } from "./types.ts";

/**
 * Words on the notion-api-shortcuts case study (/portfolio/projects/notion-api-shortcuts/).
 * Edit text here; layout lives in components/case-studies/notion-api-shortcuts.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url new-tab).
 */
export const notionApiShortcutsContent: CaseStudyContent = {
  description: "Reducing repetitive setup for service-account pages and databases in Notion—while keeping the custom icons, banners, and structure I wanted.",
  sections: [
    {
      id: "problem",
      nav: "Keep the customization. Reduce the repetition.",
      title: "Keep the customization. Reduce the repetition.",
      blocks: [
        "I wanted dedicated Notion pages for my service accounts, each with its own supporting database and customized presentation. But creating each one meant repeating the same setup: page and database structures, annual log pages, icons, and banners. I was spending hours customizing them.",
        "The goal was to reduce that redundancy without giving up the customization. I built reusable Apple Shortcuts to collect the details that changed between service accounts and create the repeated structure through the Notion API.",
      ],
    },
    {
      id: "design",
      nav: "Toolkit architecture",
      title: "A modular toolkit, not a single request",
      blocks: [
        "I separated recurring work into 14 Shortcuts: URL intake and ID extraction, authentication preparation, database and page operations, and reusable property formatters. The design favors reusable components and standardized inputs instead of one-off workflows for each task.",
        { type: "heading", level: 3, text: "From a shared link to an API target" },
        "The parsing feeds the identifiers used by the [Notion API](https://developers.notion.com/reference/intro new-tab); the workflow separates link normalization from the schema-specific request payload.",
        "**Get DB or Page ID** accepts Apps and URLs through the Share Sheet, then branches between page and database share links. The page path splits on hyphens and takes the final segment; the database path splits on `gemsforge/` and takes the second item. A replacement step removes query-string content.",
        "This makes shared links usable as API targets without manually copying identifiers. The parsing is tailored to the URL formats used in this implementation.",
        { type: "heading", level: 3, text: "Reuse authentication preparation" },
        "**Create Database** and **Create DB Pages** both call **Get Notion Api Key** before sending requests. A common helper prepares authentication details for higher-level workflows.",
        { type: "heading", level: 3, text: "Build structured property payloads" },
        "Dedicated formatters prepare JSON-compatible fragments for text, select, multi-select, and relation properties. The color-aware multi-select formatter initializes an array, loops through selected values, conditionally calls **Get Color**, and assembles objects for the API payload.",
        { type: "heading", level: 3, text: "Compose the higher-level operations" },
        {
          type: "list",
          items: [
            "**Create Database:** requests to `https://api.notion.com/v1/databases`.",
            "**Create DB Pages:** requests to `https://api.notion.com/v1/pages`.",
            "**Search Page properties** and **Update Page Property:** additional toolkit workflows for inspecting and changing properties.",
            "**Get Icon And Banner:** customized presentation resources.",
          ],
        },
        {
          type: "details",
          summary: "View all 14 workflows",
          blocks: [
            {
              type: "list",
              items: [
                "Get DB or Page ID",
                "Get ID",
                "Get Notion Api Key",
                "Create Database",
                "Create DB Pages",
                "Search Page properties",
                "Update Page Property",
                "Format Text property",
                "Format Select Property",
                "Format Multi Select Property",
                "Format Multi Select Property W/Color",
                "Format Relation property",
                "Get Color",
                "Get Icon And Banner",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "setup",
      nav: "Setup & permissions",
      title: "Integration setup & permissions",
      blocks: [
        "The workflow requires a task-specific Notion integration, its integration secret, and explicit access to the target page or database. The target must be shared with the relevant integration; a URL or identifier alone does not grant access.",
        "The secret must be supplied securely and excluded from shared workflow artifacts, screenshots, and source examples. This portfolio describes the authentication dependency without exposing credential values.",
      ],
    },
    {
      id: "tradeoffs",
      nav: "Parsing & portability",
      title: "Parsing decisions & portability",
      blocks: [
        "The database-ID parser depends on a `gemsforge/` URL segment, while the page parser uses a more general final-segment approach. Supporting other workspaces or link formats would require reviewing that assumption.",
        "The Shortcut explicitly notes unreliable regex behavior in its fallback path. The implementation combines branching, string splitting, and replacement rather than assuming one expression handles every link.",
        "These are documented limitations, not claims of universal URL support. A fresh compatibility check should cover current link formats, query parameters, and the applicable Notion API version.",
      ],
    },
    {
      id: "evidence",
      nav: "Inspect the documented workflow",
      title: "Inspect the documented workflow",
      blocks: [
        { type: "heading", level: 3, text: "A small example of structured property mapping" },
        "These Shortcuts act as a lightweight serialization layer: they transform friendly Shortcut inputs into typed Notion API property objects before a create-page or update-page request is sent.",
        { type: "heading", level: 4, text: "Color-aware multi-select" },
        {
          type: "code",
          code: `// Friendly input
{
  "name": "Research",
  "color": "blue"
}

// Notion-compatible payload
{
  "Tags": {
    "multi_select": [
      { "name": "Research", "color": "blue" }
    ]
  }
}`,
        },
        "**Format Multi Select Property W/Color** initializes an array, loops through selected values, extracts each name, checks for a color, calls **Get Color** when needed, and builds the final JSON-ready objects.",
        { type: "heading", level: 4, text: "Other typed mappings" },
        "These dictionaries follow Notion’s [property object schema](https://developers.notion.com/reference/property-object new-tab), which I used as the reference while designing the Shortcut mappings.",
        {
          type: "code",
          code: `// Select
{
  "Status": { "select": { "name": "In progress" } }
}

// Relation
{
  "Related project": {
    "relation": [{ "id": "notion-page-or-database-id" }]
  }
}

// Rich text
{
  "Description": {
    "rich_text": [{
      "type": "text",
      "text": { "content": "Project notes" }
    }]
  }
}`,
        },
        {
          type: "code",
          code: `{
  "Status": { "select": { "name": "Due ⚠️" } },
  "Year": { "select": { "name": "2025" } }
}`,
        },
        "Excerpt adapted from the documented 2024 request body. It illustrates the mapping approach, not a complete request or a current API compatibility guarantee.",
      ],
    },
    {
      id: "status",
      nav: "Historical implementation, lasting lessons",
      title: "Historical implementation, lasting lessons",
      blocks: [
        {
          type: "note",
          blocks: [
            "**Documented in 2024.** API structures and capabilities change. This is a project account, not a verified current setup tutorial. Shared Shortcuts and present-day compatibility have not been retested.",
          ],
        },
        "The enduring work is the modular dependency chain: shared-link intake, target ID extraction, reusable authentication preparation, typed property fragments, and higher-level API operations. The next step is a fresh demonstration with sample data and current API documentation.",
      ],
    },
  ],
};
