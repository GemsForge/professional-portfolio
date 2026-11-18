import type { CaseStudyContent } from "./types.ts";

/**
 * Words on the notion-api-shortcuts case study (/portfolio/projects/notion-api-shortcuts/).
 * Edit text here; layout lives in components/case-studies/notion-api-shortcuts.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url new-tab).
 */
export const notionApiShortcutsContent: CaseStudyContent = {
  description: "Consolidating expense tracking in Notion without giving up customized service pages—through Apple Shortcuts, a local C# .NET API with my own Notion client library, and later a React + Electron template builder.",
  sections: [
    {
      id: "problem",
      nav: "Keep the customization. Reduce the repetition.",
      title: "Keep the customization. Reduce the repetition.",
      blocks: [
        "Expense tracking was difficult when I had to manage so many accounts and web profiles, so I consolidated all of them in one place: **Notion**. I prefer customized pages for each product or service—its own logo, banner, supporting database, and a titled page for every billing period. Customizing them by hand became far too tedious; I was spending hours repeating the same setup.",
        "The goal was to reduce that redundancy without giving up the customization. The project grew in three phases:",
        {
          type: "list",
          items: [
            "**Phase 1 — Shortcuts calling Notion directly:** a modular Apple Shortcuts toolkit that built Notion API payloads on the phone.",
            "**Phase 2 — My own API:** a C# .NET API backed by my own Notion client library that returns Shortcut-friendly responses.",
            "**Phase 3 — A laptop UI:** a React + TypeScript client in an Electron window, with a Template Automator for branded monthly pages.",
          ],
        },
        {
          type: "list",
          items: [
            "**Mobile:** Apple Shortcuts",
            "**Laptop:** React + TypeScript in an Electron window",
            "**Backend:** C# .NET API with a custom Notion client library. It isn't hosted: it runs on my laptop, and my phone reaches it over home Wi-Fi or my Personal Hotspot",
          ],
        },
      ],
    },
    {
      id: "design",
      nav: "Phase 1: Shortcuts toolkit",
      title: "Phase 1: A modular Shortcuts toolkit, not a single request",
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
      id: "api",
      nav: "Phase 2: My own API",
      title: "Phase 2: Mapping responses was a pain, so I built my own API",
      blocks: [
        "Building requests in Shortcuts worked, but reading Notion's responses back was another story. Mapping the nested API responses into Apple Shortcuts dictionaries was a pain, and every workflow had to repeat that unpacking.",
        "So I spent even more time creating a **C# .NET API with my own Notion client library**. Rather than adopting an SDK, the library calls Notion's REST API directly through RestSharp and handles the request and response models itself. Shortcuts now call a small set of operations and get back simplified response contracts shaped for Shortcuts dictionaries—the Notion-specific property objects stay behind the API boundary.",
        "The API is not hosted. It runs on my laptop, and both clients use it from there: the Electron app on the laptop itself, and my Shortcuts on my phone. Each Shortcut starts with an **If / Otherwise** check—if my phone is on Wi-Fi, it calls the laptop's home-network address; otherwise my phone is sharing its Personal Hotspot, so it calls the laptop's hotspot address. Every request has to include my API key in an `x-api-key` header, or the API rejects it.",
        "The screenshots below are my original **Budget Database** Shortcuts—*Create Budget Database* and *Create Annual Log Pages*—kept intact but pointed at my API instead of calling Notion directly.",
        {
          type: "figure-row",
          label: "Apple Shortcuts on my iPhone calling the Notion Utility API",
          items: [
            {
              image: { src: "/assets/notion-shortcuts-library.jpg", alt: "Budget Database folder in the Shortcuts app with Notion Check Connection, 1 - Create Budget Database, List of Months, and 2 - Create Annual Log Pages", loading: "lazy" },
              caption: "My Budget Database Shortcuts on iPhone.",
            },
            {
              image: { src: "/assets/notion-shortcuts-create-budget-database.jpg", alt: "Create Budget Database Shortcut: comments, Get Wi-Fi network name, and If Network Details has any value", loading: "lazy" },
              caption: "Create Budget Database checks Wi-Fi to pick the API address.",
            },
            {
              image: { src: "/assets/notion-shortcuts-create-annual-log-pages.jpg", alt: "Create Annual Log Pages Shortcut: comments, Get Wi-Fi network name, and the same If / Otherwise address check", loading: "lazy" },
              caption: "Create Annual Log Pages uses the same If / Otherwise check.",
            },
          ],
        },
      ],
    },
    {
      id: "native-templates",
      nav: "Why not Notion templates?",
      title: "Why not Notion's built-in templates?",
      blocks: [
        "Notion already has database templates, so it is fair to ask why I did not just use them. A template is a reusable page you can stamp out from the **New** menu, and it can even repeat on a schedule.",
        {
          type: "figure",
          image: {
            src: "/assets/notion-native-template-menu.png",
            alt: "Notion's Templates for Kroger Boost menu with a New template option, opened from the database's New button",
            loading: "lazy",
          },
          caption: "Notion's built-in template menu for the Kroger Boost database.",
        },
        "But **Duplicate every…** repeats the *same* page. Every copy starts from one fixed title and layout; nothing in the template knows which month it is for or which service it belongs to. Recreating that for each service meant rebuilding the title, icon, banner, and structure by hand—the exact repetition I was trying to remove.",
        {
          type: "figure",
          image: {
            src: "/assets/notion-native-template-repeat.png",
            alt: "Notion template editor showing a fixed New page title and the Duplicate every menu with Day, Weekday, Week, 2 Weeks, Month, 3 Months, 6 Months, and Year",
            loading: "lazy",
          },
          caption: "The built-in repeat options duplicate one fixed page on a schedule.",
        },
        {
          type: "list",
          items: [
            "**Notion templates:** one static page, repeated. Titles, icons, and banners are whatever the template holds.",
            "**My Template Automator:** one blueprint per service with tokens—`{month} — {service}`—plus that service's logo and banner, previewed and generated for any date range, skipping titles that already exist.",
          ],
        },
      ],
    },
    {
      id: "workflow",
      nav: "Phase 3: Template Automator",
      title: "Phase 3: A laptop UI for branded monthly pages",
      blocks: [
        "Shortcuts remained the mobile client. On my laptop, I later added a UI module built with **React and TypeScript inside an Electron window**. Its Template Automator turns the customization I care about into a reusable blueprint. Here is the workflow using my **Kroger Boost** subscription as the example.",
        { type: "heading", level: 3, text: "Step 1: Open the Template Automator" },
        "I start in the Template Automator inside the Notion Utility Electron app.",
        {
          type: "figure",
          image: {
            src: "/assets/notion-utility-template-automator.png",
            alt: "Template Automator home in the Notion Utility Electron app",
            loading: "lazy",
          },
          caption: "The Template Automator home in my Notion Utility app.",
        },
        { type: "heading", level: 3, text: "Step 2: Brand it once ✨" },
        "This is the point of the whole project. I set the **Kroger logo** as the page icon and a **Boost cover banner**, choose a monthly cadence, and define a month-first title pattern: `{month} — {service}` with `service` set to `Kroger Boost`. Every generated page—*January — Kroger Boost*, *February — Kroger Boost*, and so on—inherits that logo and banner automatically.",
        {
          type: "figure",
          image: {
            src: "/assets/notion-utility-template-builder.png",
            alt: "Template builder with the Kroger logo as the page icon, a blue Boost cover banner, a monthly cadence, and the {month} — {service} title pattern",
            loading: "lazy",
          },
          caption: "Logo, banner, cadence, and title pattern defined once in a reusable template.",
        },
        { type: "heading", level: 3, text: "Step 3: Preview the pages before writing" },
        "Before anything is written to Notion, the API plans every page in the range and checks which titles already exist, so reruns can skip them safely.",
        {
          type: "figure",
          image: {
            src: "/assets/notion-utility-workflow-preview.png",
            alt: "Preview planning six monthly pages, January — Kroger Boost through June — Kroger Boost, before anything is written to Notion",
            loading: "lazy",
          },
          caption: "The six-page plan is visible before I write anything to Notion.",
        },
        { type: "heading", level: 3, text: "Step 4: Run the automation" },
        "A dry run is available as a final check, but once the plan looks right I run it. The API creates each page in the Kroger Boost database and reports every result with a link back to Notion. Because titles are checked first, a rerun marks the existing months as skipped instead of duplicating them.",
        {
          type: "figure",
          image: {
            src: "/assets/notion-utility-workflow-run.png",
            alt: "Run result reporting six Kroger Boost pages created, zero skipped, zero failed, with the plan now marking each month as existing",
            loading: "lazy",
          },
          caption: "Six pages created, zero skipped, zero failed—each with an open link to Notion.",
        },
        { type: "heading", level: 3, text: "Step 5: The result in Notion" },
        "The Kroger Boost database now holds one page per month, each titled month-first and carrying the Kroger icon—no hand customization required.",
        {
          type: "figure",
          image: {
            src: "/assets/notion-utility-kroger-boost-table.png",
            alt: "Kroger Boost Notion database table listing January through June — Kroger Boost pages, each with the Kroger icon, under a Boost cover banner",
            loading: "lazy",
          },
          caption: "January through June — Kroger Boost, generated and branded in Notion.",
        },
      ],
    },
    {
      id: "setup",
      nav: "Setup & permissions",
      title: "Integration setup & permissions",
      blocks: [
        "Notion only lets an integration work with pages and databases that have been shared with it. So before any of this runs, I create an integration in Notion, keep its secret, and share each service page with that integration—pasting a page link alone doesn't grant access.",
        "I keep that secret out of everything I share. Shortcut exports, screenshots, and the code samples on this page never include a real key.",
        "Since Phase 2, the Notion secret stays on my laptop in the API's user secrets. My phone only holds the Notion Utility API key, so a Shortcut never sees the integration secret.",
      ],
    },
    {
      id: "tradeoffs",
      nav: "Turning a link into an ID",
      title: "Turning a Notion link into an ID",
      blocks: [
        "**Get DB or Page ID** turns a Notion share link into the ID the API needs. For a page, it takes the last part of the link. For a database, it splits the link on my workspace name (`gemsforge/`), so it works with links from my workspace.",
        "It handles the link formats I actually use, not every Notion URL. Pointing it at another workspace would mean updating that split.",
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
      id: "learning",
      nav: "What I learned",
      title: "An early dev learning experience",
      blocks: [
        "This project let me explore Apple Shortcuts, building a C# .NET API, integrating with the Notion REST API through my own client library, and React/TypeScript client development. The biggest technical lesson was about data shape at the boundary between tools: a small, purpose-built contract made the automations far easier to read, reuse, and maintain.",
        {
          type: "note",
          blocks: [
            "**Phase 1 documented in 2024; the API and Shortcuts were rebuilt and retested end to end in 2026.** API structures and capabilities change. The Shortcuts toolkit is a project account, not a verified current setup tutorial; shared Shortcuts and present-day compatibility have not been retested.",
          ],
        },
      ],
    },
    {
      id: "reflection",
      nav: "The honest lesson",
      title: "After a year, I had to laugh at the size of the solution",
      blocks: [
        "After a year of expense tracking, I realized I might have over-engineered my entire budget-tracking strategy. I had built a phone toolkit, a local API, and a desktop template builder to make the system effortless—and then had to ask whether the system itself was doing too much.",
        "I still value what I learned and the convenience I got from it. But the bigger lesson was to check that a problem is worth solving at the size I am proposing. Sometimes the best automation is a simpler routine; sometimes the elaborate side project is the fun part. Knowing which one I need is part of building well.",
      ],
    },
  ],
};

/** Hero extras for the Aura-style header: brand mark, in-page actions, and at-a-glance stats. */
export const notionApiShortcutsHero = {
  brandIcon: { src: "/assets/auralogbook-stack/notion.png", alt: "", width: 88, height: 88 },
  // Source repo is private; switch primaryLink back to the GitHub URL once it is public.
  primaryLink: { text: "See the Kroger Boost workflow", href: "#workflow" },
  secondaryLink: { text: "Why not Notion templates?", href: "#native-templates" },
  story: {
    label: "Notion Utility screens",
    slides: [
      { image: { src: "/assets/notion-utility-template-builder.png", alt: "Template builder with the Kroger logo icon, Boost cover banner, monthly cadence, and {month} — {service} title" }, title: "Brand it once", detail: "Logo, banner, cadence, and title pattern" },
      { image: { src: "/assets/notion-utility-workflow-preview.png", alt: "Preview planning six monthly Kroger Boost pages before anything is written" }, title: "Preview", detail: "Six month-first pages planned" },
      { image: { src: "/assets/notion-utility-workflow-run.png", alt: "Run result reporting six Kroger Boost pages created with links to Notion" }, title: "Run", detail: "6 created, 0 skipped, 0 failed" },
      { image: { src: "/assets/notion-utility-kroger-boost-table.png", alt: "Kroger Boost Notion database listing January through June — Kroger Boost pages" }, title: "In Notion", detail: "January → June — Kroger Boost" },
    ],
  },
  statsLabel: "Project at a glance",
  stats: [
    { label: "Apple Shortcuts on mobile, React + Electron on laptop", value: "2 clients" },
    { label: "C# API on my laptop, called from my phone over Wi-Fi or hotspot", value: ".NET 8" },
    { label: "Reusable workflows in the Shortcuts toolkit", value: "14" },
  ],
};
