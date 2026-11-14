import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";
import { SeventyFiveHardAutomationResponsibilities } from "./75-hard-automation-responsibilities.tsx";

/** Case study page for 75-hard-automation; rendered to static HTML by scripts/prepare-pages.mjs. */
export function SeventyFiveHardAutomationCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description="A 13-Shortcut Apple and Notion system for practicing daily consistency through the 75 Soft Challenge and preparing for the Murph Challenge.">
      <div className="wrap">
        <CaseStudyHero project={project} breadcrumb="short" ownership="Independent project" tools={<div data-dependency-group="disciplineHighlights" />} framedMedia />
        <div className="case-layout">
          <aside className="case-nav">
            <nav aria-label="On this project page">
              <p>On this page</p>
              <a href="#friction">The friction</a>
              <a href="#purpose">The purpose</a>
              <a href="#solution">The technical solution</a>
              <a href="#architecture">Architecture diagram</a>
              <a href="#toolmap">Tool responsibilities</a>
              <a href="#shortcuts">Shortcut inventory</a>
              <a href="#request">Request structure</a>
              <a href="#dependencies">Dependencies</a>
              <a href="#benefit">The intended benefit</a>
              <a href="#evidence">Evidence &amp; limits</a>
            </nav>
          </aside>
          <article className="case-content">
            <section id="friction">
              <h2>The friction</h2>
              <p>Showing up for myself every day is harder when the challenge depends on memory, motivation, and scattered notes. I wanted one repeatable check-in for completion, water, exercise, personal growth, and reflection—a little discipline with some grace.</p>
              <p>I also did not want to pay for another specialized app and hope it had all the logging features I needed. Notion was the most practical logbook for me: flexible enough to capture the daily details, structured enough to show the metrics, and already part of my workflow.</p>
            </section>
            <section id="purpose">
              <h2>The purpose</h2>
              <p>The 75 Soft Challenge became my training ground for something bigger—the Murph Challenge. If I really wanted to hold myself accountable, I needed more than a good intention. I needed a visual record that showed me whether I was actually following through.</p>
              <p>Each check-in became a small piece of evidence I could review over time: completion, exercise, hydration, personal growth, reflections, and dates. Seeing it laid out helped me stay motivated and be honest about where I needed to do better.</p>
            </section>
            <section id="solution">
              <h2>The technical solution</h2>
              <p>
                The{" "}
                <strong>Log Discipline Day</strong>
                {" "}folder organizes 13 Shortcuts into a daily accountability system. Prompts and response helpers stay separate from the logging and API layer, keeping the daily experience simple while the stored record remains structured.
              </p>
              <p>
                The end-to-end flow is:{" "}
                <strong>prompt collection → response dictionary → Notion request → daily database record → progress review</strong>
                .
              </p>
              <p>
                <strong>Log Discipline</strong>
                {" "}asks for a log date, runs{" "}
                <strong>Get Discipline Response</strong>
                , reads disciplined and undisciplined values from a dictionary, conditionally combines reflection text, stores a Reflection Response variable, and references water-intake follow-up.
              </p>
            </section>
            <section id="architecture" className="architecture architecture-component" aria-label="75 Days of Discipline architecture">
              <figure className="architecture-figure">
                <button className="architecture-open" type="button" aria-haspopup="dialog" aria-controls="discipline-architecture-dialog" aria-label="Open the 75 Days of Discipline architecture diagram larger">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="10.8" cy="10.8" r="6.5" />
                    <path d="m16 16 5 5M10.8 7.5v6.6M7.5 10.8h6.6" />
                  </svg>
                  <span>Zoom</span>
                </button>
                <img className="architecture-image" src="/assets/75-days-discipline-shortcuts-diagram.svg" alt="Architecture diagram showing 75 Days of Discipline Shortcuts feeding the Log Discipline logging layer, then the Notion API, discipline database, Goal Tracker relation, Notion Chart, and progress review." loading="lazy" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Click to zoom the 75 Days of Discipline architecture diagram" />
                <figcaption>
                  <button className="architecture-text-open" type="button" aria-haspopup="dialog" aria-controls="discipline-architecture-dialog">Click to zoom</button>
                  <span>{" "}· Shortcut prompts, structured logging, Notion storage, and progress review.</span>
                </figcaption>
              </figure>
              <dialog className="architecture-dialog" id="discipline-architecture-dialog" aria-label="75 Days of Discipline architecture diagram, enlarged">
                <div className="architecture-dialog-bar">
                  <span>75 Days of Discipline architecture</span>
                  <button className="architecture-close" type="button" aria-label="Close enlarged diagram">
                    Close{" "}
                    <kbd>Esc</kbd>
                  </button>
                </div>
                <div className="architecture-zoom-area" tabIndex={0} aria-label="Move the pointer over the diagram to zoom the image around that point">
                  <img src="/assets/75-days-discipline-shortcuts-diagram.svg" alt="Enlarged 75 Days of Discipline architecture diagram" />
                </div>
              </dialog>
              <script src="/assets/architecture-diagram.js" defer />
            </section>
            <section id="toolmap">
              <h2>Tool responsibilities</h2>
              <div className="table-scroll" role="region" tabIndex={0} aria-label="75 Days of Discipline tool and responsibility table">
                <table className="toolmap">
                  <caption>Tool / Responsibility</caption>
                  <thead>
                    <tr>
                      <th scope="col">Tool or data source</th>
                      <th scope="col">Responsibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Combat Ready - Last 20 Lbs and Log Discipline</th>
                      <td>Start the daily accountability flow, collect the log date, and assemble the day’s responses.</td>
                    </tr>
                    <tr>
                      <th scope="row">Prompt and response Shortcuts</th>
                      <td>Supply morning and milestone messages and collect discipline, reflection, personal growth, water, and exercise responses.</td>
                    </tr>
                    <tr>
                      <th scope="row">Discipline Http Request</th>
                      <td>Map the collected values—including the Date value—into the structured Notion page request.</td>
                    </tr>
                    <tr>
                      <th scope="row">Notion API and discipline database</th>
                      <td>Receive and store the daily record and its Goal Tracker relation; private database and relation identifiers stay unpublished.</td>
                    </tr>
                    <tr>
                      <th scope="row">Date context and Apple Calendar</th>
                      <td>Support daily scheduling and accountability. The reviewed request carries its own Date value.</td>
                    </tr>
                    <tr>
                      <th scope="row">Finch</th>
                      <td>
                        A habit-tracking game with adorable pet care and rendering blended into a journaling and habit-tracking experience.{" "}
                        <strong>Open Finch All</strong>
                        {" "}launches it as a companion accountability layer; Finch is not the Notion system of record.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section id="shortcuts">
              <h2>Shortcut inventory</h2>
              <p>The reviewed folder contains 13 named Shortcuts, separating entry points, prompts, response helpers, logging, and the Notion request builder.</p>
              <ol>
                <li>
                  <strong>Combat Ready - Last 20 Lbs</strong>
                  {" "}— primary shortcut entry point.
                </li>
                <li>
                  <strong>Open Finch All</strong>
                  {" "}— opens the Finch companion workflow.
                </li>
                <li>
                  <strong>Get Morning Message</strong>
                  ,{" "}
                  <strong>Dynamic Morning Message</strong>
                  , and{" "}
                  <strong>Get Milestone Message</strong>
                  {" "}— prompt context.
                </li>
                <li>
                  <strong>Log Discipline</strong>
                  ,{" "}
                  <strong>Get Reflections Response</strong>
                  , and{" "}
                  <strong>Get Discipline Response</strong>
                  {" "}— daily responses.
                </li>
                <li>
                  <strong>Get Read Bible Prompt</strong>
                  ,{" "}
                  <strong>Get Water Intake</strong>
                  , and{" "}
                  <strong>Get Exercise Response</strong>
                  {" "}— personal growth and completion inputs.
                </li>
                <li>
                  <strong>Discipline Http Request</strong>
                  {" "}— centralizes the Notion API request body.
                </li>
                <li>
                  <strong>Log Discipline Day V1</strong>
                  {" "}— earlier logging workflow retained in the folder.
                </li>
              </ol>
              <figure className="case-figure">
                <img src="/assets/75-days-shortcuts-overview.png" alt="iPhone Shortcuts app showing the Log Discipline Day folder and its daily accountability shortcuts." loading="lazy" width="636" height="1406" />
                <figcaption>iPhone Shortcuts overview of the Log Discipline Day folder. Individual prompt screens are documented separately from this folder-level view.</figcaption>
              </figure>
            </section>
            <section id="request">
              <h2>Notion request structure</h2>
              <p>
                <strong>Discipline Http Request</strong>
                {" "}receives a dictionary, extracts values for{" "}
                <strong>Disciplined</strong>
                ,{" "}
                <strong>Exercise</strong>
                ,{" "}
                <strong>Water</strong>
                ,{" "}
                <strong>Faith</strong>
                ,{" "}
                <strong>Reflection</strong>
                , and{" "}
                <strong>Date</strong>
                , then builds a Notion page request.
              </p>
              <p>The request body includes a date property, a Goal Tracker relation, and structured properties for Disciplined, Exercise Completed, Water Intake, Personal Growth, and Reflection. Database and relation identifiers are intentionally not published.</p>
              <h3>Code view: redacted request body</h3>
              <p>This synthetic example mirrors the live Shortcut’s request shape:</p>
              <pre className="code">
                <code>
      {`{
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
}`}
                </code>
              </pre>
            </section>
            <SeventyFiveHardAutomationResponsibilities />
            <section id="benefit">
              <h2>Intended benefit</h2>
              <p>The system reduces the mental overhead of repeating a daily check-in, makes completion signals consistent, and preserves a searchable record of discipline, exercise, water, personal growth, reflections, and dates.</p>
              <p>It gave me one reliable place to see whether I was following through, where I was falling short, and what needed to change the next day.</p>
            </section>
            <section id="evidence">
              <h2>Evidence &amp; current limits</h2>
              <p>The Shortcut folder and editor review verify the names and behaviors described here. Public screenshots, exported Shortcuts, synthetic request/response examples, and a full run history have not yet been attached.</p>
              <p className="artifact">Next proof-of-work step: show one synthetic daily run from prompt collection through the Notion request while keeping database IDs, relation IDs, API secrets, and personal reflections private. This page documents the workflow; it does not claim a measured adherence improvement.</p>
            </section>
            <ProjectSequenceNav projects={projects} slug="75-hard-automation" previous="hair-log" />
          </article>
        </div>
      </div>
    </CaseStudyDocument>
  );
}
