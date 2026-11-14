import type { AuralogbookContent } from "./types.ts";

/**
 * Words on the auralogbook case study (/portfolio/projects/auralogbook/).
 * Edit text here; layout lives in components/case-studies/auralogbook.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url new-tab).
 */
export const auralogbookContent: AuralogbookContent = {
  description: "Full-stack Aura Logbook case study by Diamond Brown. Explore the React and TypeScript client, React Native shell, .NET API, SQLite data layer, architecture, and source code.",
  sections: [
    {
      id: "problem",
      nav: "Project goals",
      title: "Product goals and my contribution",
      blocks: [
        "Aura Logbook is a private reflection journal designed for quick phone check-ins and useful review over time. I shaped the product and built its responsive web client, React Native navigation shell, and .NET API.",
        "The engineering work connects authenticated user journeys to mood records, reflections, insights, private photo access, and configurable content. The optional Spotify connection adds listening context while playback stays in Spotify.",
        {
          type: "paragraph",
          text: "**Product boundary:** Aura supports personal reflection. It is not a diagnostic or treatment tool.",
          className: "project-boundary",
        },
      ],
    },
    {
      id: "implementation",
      nav: "Technical approach",
      title: "Technical approach",
      blocks: [
        {
          type: "cards",
          className: "engineering-highlights",
          items: [
            {
              title: "Client delivery",
              text: "The React 19 and TypeScript web client supports responsive phone and desktop layouts with Material UI, Joy UI, Redux Toolkit, RTK Query, React Router, Axios, and Recharts. A React Native/Expo shell organizes the native destinations.",
            },
            {
              title: "API and persistence",
              text: "The .NET 9 API separates controllers, injected services, and user-scoped routes. Dapper repositories and versioned SQL migrations persist journal data in SQLite for Development and FIT/Staging.",
            },
            {
              title: "Identity and integrations",
              text: "JWT-protected workflows scope journal and private-media access to the signed-in user. Spotify linking uses OAuth Authorization Code with PKCE; encrypted tokens stay in the API, while the client receives playback and playlist metadata.",
            },
            {
              title: "Configurable product data",
              text: "Database-backed definitions keep pathways, moods, colors, prompts, and presentation settings configurable. A debug-only endpoint provides sample entries for development.",
            },
          ],
        },
        {
          type: "note",
          aside: true,
          className: "note engineering-verification",
          blocks: [
            "**Verification evidence:** the repositories include Vitest and Testing Library checks for the web client, plus xUnit and Moq tests for the API. The links below show test coverage exists; they do not claim every suite has passed.",
          ],
        },
      ],
    },
    {
      id: "architecture",
      nav: "Architecture",
      kind: "architecture",
      architecture: {
        title: "Architecture and service boundaries",
        intro: "The diagram shows how the clients, authenticated API, SQLite repositories, private photo storage, and external services connect.",
        ariaLabel: "Aura Logbook architecture",
        dialogId: "architecture-dialog",
        image: {
          src: "/assets/aura-logbook-architecture.svg",
          alt: "Aura Logbook phone-first product journey and data flow: responsive React web client with desktop companion, JWT sign-in, check-ins saved through the .NET 9 API and Dapper repositories to SQLite in Development and FIT/Staging, optional private photo storage with linked attachment metadata, and a React Native + Expo navigation foundation for Today, Log, Journal, and Profile.",
          width: 2600,
          height: 1940,
        },
        openLabel: "Open the architecture diagram larger",
        imageLabel: "Click to zoom the Aura Logbook architecture diagram",
        techList: [
          "React and TypeScript web client with responsive phone and desktop layouts.",
          "React Native and Expo navigation foundation with Today, Log, Journal, and Profile destinations.",
          "Material UI, Joy UI, React Router, Redux Toolkit, RTK Query, and Axios.",
          ".NET 9 API with JWT authentication, injected services, and user-scoped routes.",
          "SQLite persistence through Dapper repositories and versioned SQL migrations for Development and FIT/Staging.",
          "Database-backed mood, aura, pathway, reflection, and insight definitions.",
          "Private photo attachment metadata with photo bytes outside public web assets.",
          "Open-Meteo REST API for contextual weather.",
        ],
        caption: "Application flow, service boundaries, data sources, and dependencies shown for Development and FIT/Staging; Production repository selections differ.",
        dialogLabel: "Aura Logbook architecture diagram, enlarged",
        dialogTitle: "Architecture diagram",
        zoomHint: "Move the pointer over the diagram to zoom the whole image around that point",
        enlargedImage: {
          src: "/assets/aura-logbook-architecture.svg",
          alt: "Enlarged Aura Logbook phone-first product journey and data flow diagram",
          width: 2600,
          height: 1940,
        },
      },
    },
    {
      id: "data-sources",
      nav: "Data model and integrations",
      title: "Relational data and integrations",
      headingId: "schema-heading",
      className: "schema-section",
      blocks: [
        "The current .NET data layer uses SQLite through Dapper and versioned SQL migrations in Development and FIT/Staging. The cards summarize the main records and integrations; they are not a complete database schema.",
        {
          type: "schema-map",
          label: "Aura Logbook relational data and integrations",
          items: [
            {
              kind: "card",
              className: "schema-user",
              kicker: "User-owned record · SQLite",
              title: "User profile",
              facts: [
                { term: "Identity", detail: "account and secure credential data" },
                { term: "Preferences", detail: "display settings and selected pathway" },
                { term: "Context", detail: "profile details that personalize reflections" },
              ],
            },
            {
              kind: "relationship",
              label: "One user can have many mood entries",
              from: "1 user",
              to: "many entries",
            },
            {
              kind: "card",
              className: "schema-mood",
              kicker: "Journal records · SQLite",
              title: "Mood entries",
              facts: [
                { term: "Entry", detail: "date, reflection, and saved context" },
                { term: "Selected moods", detail: "related mood rows per entry" },
                { term: "Updates", detail: "entry and mood relationships saved together" },
              ],
            },
            {
              kind: "card",
              className: "schema-zodiac",
              kicker: "Personalization · SQLite",
              title: "Pathways and reflections",
              facts: [
                {
                  term: "Reference definitions",
                  detail: "pathways, moods, aura colors, and their mappings",
                },
                { term: "Reflection content", detail: "prompts, responses, and insight templates" },
                { term: "Presentation", detail: "database-backed themes and graphic metadata" },
              ],
            },
            {
              kind: "card",
              className: "schema-weather",
              kicker: "Private media and external context",
              title: "Photos and weather",
              facts: [
                { term: "Photo metadata", detail: "owner and mood-entry relationships in SQLite" },
                { term: "Photo bytes", detail: "private storage outside public web assets" },
                { term: "Weather", detail: "Open-Meteo context requested by the API" },
              ],
              note: "Photo browsing supports filters, sorting, a saved grid layout, and touch-friendly lightbox navigation.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Portfolio screenshots use fictional demo content. They do not show a real account or private journal entry.",
          className: "schema-footnote",
        },
        {
          type: "paragraph",
          text: "**Source evidence:** [Dapper-backed mood repository](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Repositories/SqliteMoodRepository.cs) · [User model](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Models/User.cs) · [Mood entry model](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Models/MoodEntry.cs) · [Private media migration](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Data/Database/Migrations/012_private_mood_media.sql) · [Reference-data migration](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Data/Database/Migrations/010_data_driven_reference_configuration.sql)",
          className: "schema-sources",
        },
      ],
    },
    {
      id: "screens",
      nav: "Product screens",
      title: "Product screens",
      headingId: "screens-heading",
      blocks: [
        "Review the public entry point, sign-in, check-in, history, gallery, insights, appearance settings, and Spotify connection. Each image pairs a real React web screen with its phone or desktop companion. Open an image for a closer look. Captures use fictional demo data; the React Native/Expo navigation shell is described separately.",
        {
          type: "screen-gallery",
          dialogId: "aura-image-dialog",
          items: [
            {
              title: "Public home",
              image: {
                src: "/assets/auralogbook-tour/public-home-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Aura Logbook public landing screen on a phone with the desktop layout alongside",
              openLabel: "Open the Aura Logbook public landing screen and desktop view for a closer look",
              caption: "Public home · A clear introduction to the reflection experience on phone and desktop.",
            },
            {
              title: "Sign in",
              image: {
                src: "/assets/auralogbook-tour/login-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Aura Logbook sign-in screen on a phone in front of its desktop layout",
              openLabel: "Open the Aura Logbook sign-in screen and desktop layout for a closer look",
              caption: "Sign in · The refreshed entry screen adapts from phone to desktop.",
            },
            {
              title: "Home",
              image: {
                src: "/assets/auralogbook-tour/home-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Aura Logbook home screen on a phone in front of its desktop dashboard",
              openLabel: "Open the Aura Logbook home screen and desktop dashboard for a closer look",
              caption: "Home · A calm starting point for the day’s check-in and reflection.",
            },
            {
              title: "Check in",
              image: {
                src: "/assets/auralogbook-tour/check-in-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Mood check-in on a phone with the desktop experience alongside",
              openLabel: "Open the Aura Logbook mood check-in and desktop experience for a closer look",
              caption: "Check in · Choose a mood and write a short reflection.",
            },
            {
              title: "History",
              image: {
                src: "/assets/auralogbook-tour/reflections-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Saved reflections on a phone with the desktop history view alongside",
              openLabel: "Open the Aura Logbook reflection history and desktop view for a closer look",
              caption: "History · Revisit saved entries across both screen sizes.",
            },
            {
              title: "Individual reflection",
              image: {
                src: "/assets/auralogbook-tour/individual-record-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "An individual photo-backed reflection on a phone beside its desktop view, with its weather snapshot",
              openLabel: "Open an individual Aura Logbook reflection and desktop view for a closer look",
              caption: "Individual reflection: review a saved thought, its photos, and captured context.",
            },
            {
              title: "Photo gallery",
              image: {
                src: "/assets/auralogbook-tour/gallery-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Aura Logbook private photo gallery with nine sample photos on a phone and desktop",
              openLabel: "Open the Aura Logbook photo gallery and desktop view for a closer look",
              caption: "Gallery: browse generated sample photos linked to fictional journal entries.",
            },
            {
              title: "Insights",
              image: {
                src: "/assets/auralogbook-tour/insights-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Mood insights on a phone with the desktop analytics view alongside",
              openLabel: "Open the Aura Logbook mood insights and desktop analytics for a closer look",
              caption: "Insights: compare reflection patterns on phone and desktop.",
            },
            {
              title: "Appearance selector in Light mode",
              image: {
                src: "/assets/auralogbook-tour/appearance-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Aura Logbook in Light mode with the Light, Dark, and Use device setting appearance selector open on phone and desktop",
              openLabel: "Open the Aura Logbook appearance selector and desktop view for a closer look",
              caption: "Appearance: choose Light, Dark, or the device setting.",
            },
            {
              title: "Spotify integration",
              image: {
                src: "/assets/auralogbook-tour/spotify-pair.png",
                alt: "",
                width: 1600,
                height: 1100,
                loading: "lazy",
              },
              enlargedAlt: "Aura Logbook Spotify panel on phone and desktop showing Frontline by Butcher Brown with Discover Weekly, daylist, and Your Summer Rewind",
              openLabel: "Open the Aura Logbook Spotify panel and desktop view for a closer look",
              caption: "Spotify: show playback and playlist context without handling audio playback.",
            },
          ],
        },
      ],
    },
    {
      id: "journey",
      nav: "Core user flow",
      title: "Core user flow",
      headingId: "journey-heading",
      blocks: [
        "The main workflow connects account access, daily entries, saved history, and reflection insights.",
        {
          type: "steps",
          className: "mood-workflow",
          items: [
            {
              title: "Register or sign in",
              text: "Authenticate before entering personal journal data.",
            },
            {
              title: "Record a check-in",
              text: "Save a date, one or more moods, and an optional reflection.",
            },
            {
              title: "Review saved entries",
              text: "Browse by date range, then update or delete an entry.",
            },
            {
              title: "Explore patterns",
              text: "Use summaries, charts, and pathway-specific reflection content.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "The React Native/Expo navigation shell organizes Today, Log, Journal, and Profile. The paired captures show the responsive React web client.",
          className: "workflow-context",
        },
      ],
    },
    {
      id: "evidence",
      nav: "Source evidence",
      title: "Source evidence",
      blocks: [
        "Use these entry points to trace the API, data access, client routing, and tests behind the project.",
        {
          type: "list",
          items: [
            "**API boundaries:** [mood endpoints](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Controllers/MoodController.cs), [authentication endpoints](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Controllers/AuthController.cs)",
            "**Persistence:** [Dapper mood repository](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Repositories/SqliteMoodRepository.cs), [user repository](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Repositories/SqliteUserRepository.cs), [versioned migrations](https://github.com/GemsForge/aura-logbook-api/tree/master/AuraLogbook.Api/Data/Database/Migrations)",
            "**Client:** [session restoration and routing](https://github.com/GemsForge/aura-logbook-api/blob/master/aura-ui/src/App.tsx), [React client](https://github.com/GemsForge/aura-logbook-api/tree/master/aura-ui), [native shell notes](https://github.com/GemsForge/aura-logbook-api/blob/master/docs/ux/mobile-shell.md)",
            "**Tests:** [API service tests](https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api.Tests/MoodServiceTests.cs), [client workflow tests](https://github.com/GemsForge/aura-logbook-api/blob/master/aura-ui/src/pages/tests/MoodEntryForm.test.tsx)",
          ],
        },
      ],
    },
  ],
  hero: {
    brandIcon: {
      src: "/assets/auralogbook-tour/aura-logbook-approved.webp",
      alt: "",
      width: 88,
      height: 88,
    },
    sourceLink: {
      text: "View source on GitHub ↗",
      href: "https://github.com/GemsForge/aura-logbook-api",
    },
    screensLink: { text: "Browse app screens", href: "#screens" },
    statsLabel: "Project at a glance",
    stats: [
      { label: "React web + Expo shell", value: "2 clients" },
      { label: "API on Dapper and SQLite", value: ".NET 9" },
      { label: "Spotify OAuth, tokens kept in the API", value: "PKCE" },
    ],
  },
  story: {
    label: "Aura Logbook phone screens",
    slides: [
      {
        image: {
          src: "/assets/auralogbook-tour/home-mobile.png",
          alt: "Aura Logbook home screen on a phone with the daily mood check-in",
        },
        title: "Home",
        detail: "daily check-in",
      },
      {
        image: {
          src: "/assets/auralogbook-tour/check-in-mobile-top.png",
          alt: "Aura Logbook mood check-in on a phone",
        },
        title: "Check in",
        detail: "moods and detail",
      },
      {
        image: {
          src: "/assets/auralogbook-tour/reflections-mobile.png",
          alt: "Saved Aura Logbook reflections on a phone",
        },
        title: "Reflections",
        detail: "saved entries",
      },
      {
        image: {
          src: "/assets/auralogbook-tour/insights-mobile.png",
          alt: "Aura Logbook mood insights on a phone",
        },
        title: "Insights",
        detail: "patterns over time",
      },
    ],
  },
  snapshot: {
    title: "Project snapshot",
    facts: [
      { term: "Role", detail: "Product design and full-stack development" },
      { term: "Clients", detail: "React 19, TypeScript, React Native, Expo" },
      { term: "API and data", detail: "C#, .NET 9, SQLite, Dapper, SQL migrations" },
      {
        term: "System concerns",
        detail: "Authentication, user-scoped data, private media, Spotify OAuth",
      },
    ],
    status: { label: "Status", value: "Independent project in development" },
  },
  imageDialog: {
    id: "aura-image-dialog",
    afterSection: "screens",
    defaultTitle: "Aura Logbook screen",
    help: "Swipe sideways to explore the phone and desktop views.",
    viewportLabel: "Enlarged Aura Logbook screen. Swipe or scroll sideways to view the full image.",
  },
};
