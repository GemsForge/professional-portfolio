import type { CaseStudyContent } from "./types.ts";

/**
 * Words on the 75-hard-automation case study (/portfolio/projects/75-hard-automation/).
 * Edit text here; layout lives in components/case-studies/75-hard-automation.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url new-tab).
 */
export const seventyFiveHardAutomationContent: CaseStudyContent = {
  description: "A 13-Shortcut Apple and Notion system for practicing daily consistency through the 75 Soft Challenge and preparing for the Murph Challenge.",
  sections: [
    {
      id: "friction",
      nav: "The friction",
      title: "The friction",
      blocks: [
        "Showing up for myself every day is harder when the challenge depends on memory, motivation, and scattered notes. I wanted one repeatable check-in for completion, water, exercise, personal growth, and reflection—a little discipline with some grace.",
        "I also did not want to pay for another specialized app and hope it had all the logging features I needed. Notion was the most practical logbook for me: flexible enough to capture the daily details, structured enough to show the metrics, and already part of my workflow.",
      ],
    },
    {
      id: "purpose",
      nav: "The purpose",
      title: "The purpose",
      blocks: [
        "The 75 Soft Challenge became my training ground for something bigger—the Murph Challenge. If I really wanted to hold myself accountable, I needed more than a good intention. I needed a visual record that showed me whether I was actually following through.",
        "Each check-in became a small piece of evidence I could review over time: completion, exercise, hydration, personal growth, reflections, and dates. Seeing it laid out helped me stay motivated and be honest about where I needed to do better.",
      ],
    },
    {
      id: "solution",
      nav: "The technical solution",
      title: "The technical solution",
      blocks: [
        "The **Log Discipline Day** folder organizes 13 Shortcuts into a daily accountability system. Prompts and response helpers stay separate from the logging and API layer, keeping the daily experience simple while the stored record remains structured.",
        "The end-to-end flow is: **prompt collection → response dictionary → Notion request → daily database record → progress review**.",
        "**Log Discipline** asks for a log date, runs **Get Discipline Response**, reads disciplined and undisciplined values from a dictionary, conditionally combines reflection text, stores a Reflection Response variable, and references water-intake follow-up.",
      ],
    },
    {
      id: "architecture",
      nav: "Architecture diagram",
      kind: "architecture",
      architecture: {
        ariaLabel: "75 Days of Discipline architecture",
        dialogId: "discipline-architecture-dialog",
        image: {
          src: "/assets/75-days-discipline-shortcuts-diagram.svg",
          alt: "Architecture diagram showing 75 Days of Discipline Shortcuts feeding the Log Discipline logging layer, then the Notion API, discipline database, Goal Tracker relation, Notion Chart, and progress review.",
        },
        openLabel: "Open the 75 Days of Discipline architecture diagram larger",
        imageLabel: "Click to zoom the 75 Days of Discipline architecture diagram",
        caption: "Shortcut prompts, structured logging, Notion storage, and progress review.",
        dialogLabel: "75 Days of Discipline architecture diagram, enlarged",
        dialogTitle: "75 Days of Discipline architecture",
        zoomHint: "Move the pointer over the diagram to zoom the image around that point",
        enlargedImage: {
          src: "/assets/75-days-discipline-shortcuts-diagram.svg",
          alt: "Enlarged 75 Days of Discipline architecture diagram",
        },
      },
    },
    {
      id: "toolmap",
      nav: "Tool responsibilities",
      title: "Tool responsibilities",
      blocks: [
        {
          type: "table",
          label: "75 Days of Discipline tool and responsibility table",
          caption: "Tool / Responsibility",
          columns: ["Tool or data source", "Responsibility"],
          rows: [
            [
              "Combat Ready - Last 20 Lbs and Log Discipline",
              "Start the daily accountability flow, collect the log date, and assemble the day’s responses.",
            ],
            [
              "Prompt and response Shortcuts",
              "Supply morning and milestone messages and collect discipline, reflection, personal growth, water, and exercise responses.",
            ],
            [
              "Discipline Http Request",
              "Map the collected values—including the Date value—into the structured Notion page request.",
            ],
            [
              "Notion API and discipline database",
              "Receive and store the daily record and its Goal Tracker relation; private database and relation identifiers stay unpublished.",
            ],
            [
              "Date context and Apple Calendar",
              "Support daily scheduling and accountability. The reviewed request carries its own Date value.",
            ],
            [
              "Finch",
              "A habit-tracking game with adorable pet care and rendering blended into a journaling and habit-tracking experience. **Open Finch All** launches it as a companion accountability layer; Finch is not the Notion system of record.",
            ],
          ],
        },
      ],
    },
    {
      id: "shortcuts",
      nav: "Shortcut inventory",
      title: "Shortcut inventory",
      blocks: [
        "The reviewed folder contains 13 named Shortcuts, separating entry points, prompts, response helpers, logging, and the Notion request builder.",
        {
          type: "list",
          ordered: true,
          items: [
            "**Combat Ready - Last 20 Lbs** — primary shortcut entry point.",
            "**Open Finch All** — opens the Finch companion workflow.",
            "**Get Morning Message**, **Dynamic Morning Message**, and **Get Milestone Message** — prompt context.",
            "**Log Discipline**, **Get Reflections Response**, and **Get Discipline Response** — daily responses.",
            "**Get Read Bible Prompt**, **Get Water Intake**, and **Get Exercise Response** — personal growth and completion inputs.",
            "**Discipline Http Request** — centralizes the Notion API request body.",
            "**Log Discipline Day V1** — earlier logging workflow retained in the folder.",
          ],
        },
        {
          type: "figure",
          image: {
            src: "/assets/75-days-shortcuts-overview.png",
            alt: "iPhone Shortcuts app showing the Log Discipline Day folder and its daily accountability shortcuts.",
            width: 636,
            height: 1406,
            loading: "lazy",
          },
          caption: "iPhone Shortcuts overview of the Log Discipline Day folder. Individual prompt screens are documented separately from this folder-level view.",
        },
      ],
    },
    {
      id: "request",
      nav: "Request structure",
      title: "Notion request structure",
      blocks: [
        "**Discipline Http Request** receives a dictionary, extracts values for **Disciplined**, **Exercise**, **Water**, **Faith**, **Reflection**, and **Date**, then builds a Notion page request.",
        "The request body includes a date property, a Goal Tracker relation, and structured properties for Disciplined, Exercise Completed, Water Intake, Personal Growth, and Reflection. Database and relation identifiers are intentionally not published.",
        { type: "heading", level: 3, text: "Code view: redacted request body" },
        "This synthetic example mirrors the live Shortcut’s request shape:",
        {
          type: "code",
          code: `{
  "parent": { "database_id": "DATABASE_ID_REDACTED" },
  "icon": { "type": "emoji", "emoji": "⭐" },
  "properties": {
    "Log": { "title": [{ "text": { "content": "Log 2026-10-19" } }] },
    "Date": { "date": { "start": "2026-10-19" } },
    "Goal Tracker": { "relation": [{ "id": "GOAL_TRACKER_RELATION_ID_REDACTED" }] },
    "Disciplined": { "select": { "name": "Yes" } },
    "Exercise Completed": { "select": { "name": "Yes" } },
    "Water Intake": { "select": { "name": "80 fl oz" } },
    "Faith": { "multi_select": [{ "name": "Read 2 pages" }] },
    "Reflection": { "rich_text": [{ "text": { "content": "Completed the daily check-in and stayed consistent." } }] }
  }
}`,
        },
      ],
    },
    {
      id: "dependencies",
      nav: "Dependencies",
      title: "Application responsibilities",
      blocks: [
        "The workflow separates the daily prompt and helper actions from the request builder and Notion record store.",
        {
          type: "table",
          label: "75 Days of Discipline tool responsibility table",
          caption: "75 Days of Discipline system responsibilities",
          columns: ["Tool / component", "Responsibility"],
          rows: [
            [
              "Apple Shortcuts",
              "Runs the 13 workflows, collects daily responses, applies conditional logic, and assembles the record.",
            ],
            [
              "Log Discipline",
              "Coordinates the daily date, completion signals, reflection text, and water-intake follow-up.",
            ],
            [
              "Response helper shortcuts",
              "Supply disciplined / undisciplined, exercise, water, faith, and reflection values to the logging flow.",
            ],
            [
              "Discipline Http Request",
              "Extracts the expected values from a dictionary and builds a consistent Notion page request.",
            ],
            [
              "Notion API",
              "Receives the structured page request and creates the daily discipline record.",
            ],
            [
              "Discipline database + Goal Tracker relation",
              "Store the daily properties and link the entry to its goal context; private database and relation IDs stay unpublished.",
            ],
            [
              "Date context",
              "Supplies the log date used by the workflow and the Notion date property.",
            ],
            [
              "Finch companion workflow",
              "Provides an adjacent accountability tool opened by the “Open Finch All” shortcut; it is not the Notion data store.",
            ],
            [
              "Integration permissions",
              "Authorize the Notion integration to access the target database and relation.",
            ],
          ],
        },
      ],
    },
    {
      id: "challenge",
      title: "The challenge rules",
      blocks: [
        "The daily experience is intentionally 75 Soft-style: discipline with grace, consistency over perfection, and a reset after missed days.",
        {
          type: "list",
          items: [
            "**Disciplined Day** — choose `Yes` or `No`. A `No` response can include `Distracted`, `Half-Committed`, or `Discouraged` as follow-up reasons.",
            "**Exercise** — choose `Yes` or `No`. A `No` response records `Pain 🤕`, `Almost! 20 mins minimum.`, or `Not in the mood… 😓`.",
            "**Hydration** — choose 0, 40, 60, 70, or 80 fl oz. The selected value is stored as `Water Intake Response`; 80 fl oz is the completion target, and any lower value sets `Low Water Intake` for the reflection record.",
            "**Mindful Content** — choose `Read 2 pages`, `Prayer ☀️`, `Prayer 🌙`, `Mindful content`, or `Did not make time 🚫` through the `Get Read Bible Prompt` Shortcut.",
            "**Reflections** — choose `Yes` or `No`; `Yes` opens free-text reflection input, while `No` leaves the reflection text empty.",
          ],
        },
        "Reflections, encouraging friends, and streak celebrations are optional but encouraged. Finch supplies the companion accountability layer, while the Shortcut and Notion workflow preserves the structured personal record.",
      ],
    },
    {
      id: "benefit",
      nav: "The intended benefit",
      title: "Intended benefit",
      blocks: [
        "The system reduces the mental overhead of repeating a daily check-in, makes completion signals consistent, and preserves a searchable record of discipline, exercise, water, personal growth, reflections, and dates.",
        "It gave me one reliable place to see whether I was following through, where I was falling short, and what needed to change the next day.",
      ],
    },
    {
      id: "evidence",
      nav: "Evidence & limits",
      title: "Evidence & current limits",
      blocks: [
        "The Shortcut folder and editor review verify the names and behaviors described here. Public screenshots, exported Shortcuts, synthetic request/response examples, and a full run history have not yet been attached.",
        {
          type: "paragraph",
          text: "Next proof-of-work step: show one synthetic daily run from prompt collection through the Notion request while keeping database IDs, relation IDs, API secrets, and personal reflections private. This page documents the workflow; it does not claim a measured adherence improvement.",
          className: "artifact",
        },
      ],
    },
  ],
};
