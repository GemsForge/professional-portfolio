import type { CaseStudyContent } from "./types.ts";

/**
 * Words on the dev-wiki case study (/portfolio/projects/dev-wiki/).
 * Edit text here; layout lives in components/case-studies/dev-wiki.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url new-tab).
 */
export const devWikiContent: CaseStudyContent = {
  description: "GemsForge DevWiki — a personal technical knowledge base Diamond Brown built to centralize full-stack development patterns, best practices, and guides.",
  sections: [
    {
      id: "problem",
      nav: "My own reference, written to last",
      title: "My own reference, written to last",
      blocks: [
        "When I joined ADP as a new full-stack engineer, I ran into the same wall almost every week: I knew what I needed to do but not the idiomatic way to do it. TypeScript gave me type errors I didn't know how to read. C#/.NET had patterns I'd never seen before. SQL queries got complex in ways I couldn't quickly untangle.",
        "Stack Overflow gives answers to specific error messages. Official documentation is reference material for people who already know the technology. Neither gives you what a newer developer actually needs: the pattern, the reason behind it, and an example you can trust.",
        "I built the DevWiki so I'd have exactly that — a knowledge base in my own words, organized the way my brain actually searches for things.",
      ],
    },
    {
      id: "structure",
      nav: "Organized by technology, not date",
      title: "Organized by technology, not date",
      blocks: [
        "Most personal notes systems are chronological — you write something, file it by date, and hope you remember to look for it. That doesn't work for technical reference. When I need to remember how to handle async errors in TypeScript, I don't want to find a note from March 2024; I want to find *the TypeScript async error patterns article*.",
        "The DevWiki is organized by technology category: React, TypeScript, C#/.NET, SQL, accessibility (WCAG/ARIA), CI/CD, and debugging approaches. Within each category, articles are organized by concept. Each article follows the same structure so the information is always in the same place: what the pattern is, why it exists, a code example, and when to use it.",
      ],
    },
    {
      id: "writing",
      nav: "Writing it is the learning",
      title: "Writing it is the learning",
      blocks: [
        "The process of writing a wiki article forced me to understand something well enough to explain it. If I couldn't explain a pattern in my own words — without copying the official docs — I didn't actually understand it yet.",
        "This made the DevWiki more valuable as a learning tool than any video course or tutorial. The articles I wrote while working through a problem at ADP are the ones I still use as reference, because I know why each one exists.",
        "It also gave me a documentation habit. The same thinking I applied to the DevWiki — write the why, not just the what; use examples; make it searchable — is what I brought to the developer onboarding guides at ADP.",
      ],
    },
    {
      id: "content",
      nav: "What's inside",
      title: "What's inside",
      blocks: [
        { type: "heading", level: 3, text: "Full-stack patterns" },
        "React component patterns, TypeScript generics and utility types, Redux state management, C#/.NET service and repository patterns, and REST API design conventions. Each article ties the pattern to a real use case rather than an abstract example.",
        { type: "heading", level: 3, text: "Data and queries" },
        "SQL query patterns for PostgreSQL and SQL Server, including joins, aggregations, and common performance considerations. Written to be useful during code review and debugging, not just initial implementation.",
        { type: "heading", level: 3, text: "Accessibility reference" },
        "WCAG guidelines and ARIA roles in plain language, with component-level guidance for the patterns I encountered most during the accessibility refactor at ADP: form fields, modals, live regions, and keyboard navigation.",
        { type: "heading", level: 3, text: "Debugging and operations" },
        "Splunk query patterns, local debugging approaches for full-stack .NET/React applications, and CI/CD notes for the pipelines I work with day to day.",
      ],
    },
    {
      id: "evidence",
      nav: "Inspect it live",
      title: "Inspect it live",
      blocks: [
        "The DevWiki is live and in active use at [gemsforge.com/knowledge](/knowledge/). Articles are added as I learn and updated when my understanding changes.",
        "It is a working personal reference, not a polished product — which is the point. Its structure reflects how I actually think about and search for technical knowledge, not how a textbook would organize it.",
      ],
    },
  ],
};
