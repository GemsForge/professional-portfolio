import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/** Case study page for dev-wiki; rendered to static HTML by scripts/prepare-pages.mjs. */
export function DevWikiCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description="GemsForge DevWiki — a personal technical knowledge base Diamond Brown built to centralize full-stack development patterns, best practices, and guides.">
      <div className="wrap">
        <CaseStudyHero project={project} />
        <div className="case-layout">
          <aside className="case-nav">
            <nav aria-label="On this project page">
              <p>On this page</p>
              <a href="#problem">My own reference, written to last</a>
              <a href="#structure">Organized by technology, not date</a>
              <a href="#writing">Writing it is the learning</a>
              <a href="#content">What&apos;s inside</a>
              <a href="#evidence">Inspect it live</a>
            </nav>
          </aside>
          <article className="case-content">
            <section id="problem">
              <h2>My own reference, written to last</h2>
              <p>When I joined ADP as a new full-stack engineer, I ran into the same wall almost every week: I knew what I needed to do but not the idiomatic way to do it. TypeScript gave me type errors I didn&apos;t know how to read. C#/.NET had patterns I&apos;d never seen before. SQL queries got complex in ways I couldn&apos;t quickly untangle.</p>
              <p>Stack Overflow gives answers to specific error messages. Official documentation is reference material for people who already know the technology. Neither gives you what a newer developer actually needs: the pattern, the reason behind it, and an example you can trust.</p>
              <p>I built the DevWiki so I&apos;d have exactly that — a knowledge base in my own words, organized the way my brain actually searches for things.</p>
            </section>
            <section id="structure">
              <h2>Organized by technology, not date</h2>
              <p>
                Most personal notes systems are chronological — you write something, file it by date, and hope you remember to look for it. That doesn&apos;t work for technical reference. When I need to remember how to handle async errors in TypeScript, I don&apos;t want to find a note from March 2024; I want to find{" "}
                <em>the TypeScript async error patterns article</em>
                .
              </p>
              <p>The DevWiki is organized by technology category: React, TypeScript, C#/.NET, SQL, accessibility (WCAG/ARIA), CI/CD, and debugging approaches. Within each category, articles are organized by concept. Each article follows the same structure so the information is always in the same place: what the pattern is, why it exists, a code example, and when to use it.</p>
            </section>
            <section id="writing">
              <h2>Writing it is the learning</h2>
              <p>The process of writing a wiki article forced me to understand something well enough to explain it. If I couldn&apos;t explain a pattern in my own words — without copying the official docs — I didn&apos;t actually understand it yet.</p>
              <p>This made the DevWiki more valuable as a learning tool than any video course or tutorial. The articles I wrote while working through a problem at ADP are the ones I still use as reference, because I know why each one exists.</p>
              <p>It also gave me a documentation habit. The same thinking I applied to the DevWiki — write the why, not just the what; use examples; make it searchable — is what I brought to the developer onboarding guides at ADP.</p>
            </section>
            <section id="content">
              <h2>What&apos;s inside</h2>
              <h3>Full-stack patterns</h3>
              <p>React component patterns, TypeScript generics and utility types, Redux state management, C#/.NET service and repository patterns, and REST API design conventions. Each article ties the pattern to a real use case rather than an abstract example.</p>
              <h3>Data and queries</h3>
              <p>SQL query patterns for PostgreSQL and SQL Server, including joins, aggregations, and common performance considerations. Written to be useful during code review and debugging, not just initial implementation.</p>
              <h3>Accessibility reference</h3>
              <p>WCAG guidelines and ARIA roles in plain language, with component-level guidance for the patterns I encountered most during the accessibility refactor at ADP: form fields, modals, live regions, and keyboard navigation.</p>
              <h3>Debugging and operations</h3>
              <p>Splunk query patterns, local debugging approaches for full-stack .NET/React applications, and CI/CD notes for the pipelines I work with day to day.</p>
            </section>
            <section id="evidence">
              <h2>Inspect it live</h2>
              <p>
                The DevWiki is live and in active use at{" "}
                <a href="/knowledge/">gemsforge.com/knowledge</a>
                . Articles are added as I learn and updated when my understanding changes.
              </p>
              <p>It is a working personal reference, not a polished product — which is the point. Its structure reflects how I actually think about and search for technical knowledge, not how a textbook would organize it.</p>
            </section>
            <ProjectSequenceNav projects={projects} slug="dev-wiki" next="notion-api-shortcuts" />
          </article>
        </div>
      </div>
    </CaseStudyDocument>
  );
}
