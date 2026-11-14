import type { CaseStudyContent } from "./types.ts";

/**
 * Words on the hair-log case study (/portfolio/projects/hair-log/).
 * Edit text here; layout lives in components/case-studies/hair-log.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url "new-tab").
 */
export const hairLogContent: CaseStudyContent = {
  description: "An 18-Shortcut hair-care tracking system using Apple Shortcuts, Apple Calendar, and the Notion API.",
  sections: [
    {
      id: "friction",
      nav: "The friction",
      title: "The friction",
      blocks: [
        "Hair-care activities, products, styles, conditions, prices, and results are easy to forget or record inconsistently. Finding a previous entry also requires manually searching through a growing Notion log.",
      ],
    },
    {
      id: "solution",
      nav: "The technical solution",
      title: "The technical solution",
      blocks: [
        "Built a modular Apple Shortcuts application connected to a Notion hair-care database. **Care Menu** is the user-facing entry point. It routes to logging, search, and reusable property helpers rather than placing every decision in one large Shortcut.",
        "The search workflow calls the Notion API, processes returned pages in a loop, builds a title-to-details dictionary containing each log’s readable title, page URL, and date, presents recent entries for selection, and opens the selected Notion page. Apple Calendar is part of the application context for date-based care tracking and review.",
      ],
    },
    {
      id: "toolmap",
      nav: "Tool responsibilities",
      title: "Tool responsibilities",
      blocks: [
        {
          type: "table",
          label: "Hair Care Log tool and responsibility table",
          caption: "Tool / Responsibility",
          columns: ["Tool or data source", "Responsibility"],
          rows: [
            [
              "Apple Shortcuts — Care Menu, Log Hair Care, Log Hair Retie",
              "Provide the entry point and capture hair-care activities for logging.",
            ],
            [
              "Search Care Logs and Select Latest Log Entry",
              "Search Notion results, prepare readable titles with page links and dates, and open the selected record.",
            ],
            [
              "Hair Care HTTP Request and property helpers",
              "Make Notion API requests and read the configured activity, product, image, price, style, condition, and process properties.",
            ],
            [
              "Notion API and hair-care database",
              "Search and store the structured care-log records; the database remains the source of truth.",
            ],
            [
              "Apple Calendar",
              "Provides date-based context for care tracking and review; it is not represented as the log database.",
            ],
            [
              "Notion integration and property schema",
              "Grant access to the required pages and database and keep helper names and data types aligned, without publishing credentials or private IDs.",
            ],
          ],
        },
      ],
    },
    {
      id: "actions",
      nav: "Shortcut actions",
      title: "Shortcut actions",
      blocks: [
        "The Hair Care Log folder contains these 18 named Shortcuts:",
        {
          type: "list",
          ordered: true,
          items: [
            "**Care Menu** — central user-facing router.",
            "**Log Hair Care** — records a hair-care activity.",
            "**Log Hair Retie** — records a retie event.",
            "**Search Care Logs** — searches existing Notion records.",
            "**Select Latest Log Entry** — presents recent entries for selection.",
            "**Hair Care HTTP Request** — centralizes Notion API request behavior.",
            "**Get Care Activity** — retrieves the activity property.",
            "**Get Products** — retrieves products associated with a log.",
            "**Get Product Images** — retrieves product image data.",
            "**Get Product Price** — retrieves product price data.",
            "**Get Product Type** — retrieves product type data.",
            "**Add Pros To Product** — adds product advantages to a record.",
            "**Add Cons To Product** — adds product drawbacks to a record.",
            "**Get Hair Style** — retrieves the hair-style property.",
            "**Get Hair Style 2** — supports a second style value or style branch.",
            "**Get Initial Condition** — retrieves the starting condition.",
            "**Get Completed Condition** — retrieves the ending condition.",
            "**Get Process Type** — retrieves the process classification.",
          ],
        },
      ],
    },
    {
      id: "dependencies",
      nav: "Application dependencies",
      title: "Application responsibilities",
      blocks: [
        "The system is divided across the shortcut interface, reusable request helpers, Notion data, and date context.",
        {
          type: "table",
          label: "Hair Care Log tool responsibility table",
          caption: "Hair Care Log system responsibilities",
          columns: ["Tool / component", "Responsibility"],
          rows: [
            [
              "Apple Shortcuts",
              "Runs the 18 workflows, prompts, routing, API requests, result parsing, and reusable property helpers.",
            ],
            [
              "Care Menu",
              "Acts as the user-facing entry point and routes to logging, search, and supporting actions.",
            ],
            [
              "Log Hair Care / Log Hair Retie",
              "Collect and submit the details for a care activity or retie event.",
            ],
            [
              "Hair Care HTTP Request",
              "Centralizes Notion API request behavior so helper shortcuts use a consistent integration path.",
            ],
            [
              "Search Care Logs",
              "Queries the Notion API, processes matching pages, and prepares recent entries for selection.",
            ],
            [
              "Notion API + hair-care database",
              "Store the source-of-truth records and return page properties, dates, URLs, and related details.",
            ],
            [
              "Apple Calendar",
              "Provides surrounding date context for care tracking and review; it is separate from the Notion record store.",
            ],
            [
              "Integration permissions + property schema",
              "Allow the integration to access the database and keep the property helpers aligned with Notion field names and types.",
            ],
          ],
        },
      ],
    },
    {
      id: "benefit",
      title: "Intended benefit",
      blocks: [
        "Reduce the cognitive load of maintaining a long-term hair-care record, make previous entries easier to retrieve, and create more consistent data for reviewing products, routines, styles, and outcomes.",
      ],
    },
    {
      id: "evidence",
      nav: "Evidence & limits",
      title: "Evidence & current limits",
      blocks: [
        "The reviewed workflow documentation establishes the 18-Shortcut structure and the Notion search behavior described here. Public screenshots, exported Shortcuts, synthetic API request and response examples, and the database schema with private identifiers removed have not yet been attached.",
        {
          type: "paragraph",
          text: "Next proof-of-work step: show one new care entry, one Notion search, and retrieval of a previous log while keeping API keys, page IDs, and personal records private.",
          className: "artifact",
        },
      ],
    },
  ],
};
