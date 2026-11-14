import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";
import { HairLogResponsibilities } from "./hair-log-responsibilities.tsx";

/** Case study page for hair-log; rendered to static HTML by scripts/prepare-pages.mjs. */
export function HairLogCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description="An 18-Shortcut hair-care tracking system using Apple Shortcuts, Apple Calendar, and the Notion API.">
      <div className="wrap">
        <CaseStudyHero project={project} breadcrumb="short" />
        <div className="case-layout">
          <aside className="case-nav">
            <nav aria-label="On this project page">
              <p>On this page</p>
              <a href="#friction">The friction</a>
              <a href="#solution">The technical solution</a>
              <a href="#toolmap">Tool responsibilities</a>
              <a href="#actions">Shortcut actions</a>
              <a href="#dependencies">Application dependencies</a>
              <a href="#evidence">Evidence &amp; limits</a>
            </nav>
          </aside>
          <article className="case-content">
            <section id="friction">
              <h2>The friction</h2>
              <p>Hair-care activities, products, styles, conditions, prices, and results are easy to forget or record inconsistently. Finding a previous entry also requires manually searching through a growing Notion log.</p>
            </section>
            <section id="solution">
              <h2>The technical solution</h2>
              <p>
                Built a modular Apple Shortcuts application connected to a Notion hair-care database.{" "}
                <strong>Care Menu</strong>
                {" "}is the user-facing entry point. It routes to logging, search, and reusable property helpers rather than placing every decision in one large Shortcut.
              </p>
              <p>The search workflow calls the Notion API, processes returned pages in a loop, builds a title-to-details dictionary containing each log’s readable title, page URL, and date, presents recent entries for selection, and opens the selected Notion page. Apple Calendar is part of the application context for date-based care tracking and review.</p>
            </section>
            <section id="toolmap">
              <h2>Tool responsibilities</h2>
              <div className="table-scroll" role="region" tabIndex={0} aria-label="Hair Care Log tool and responsibility table">
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
                      <th scope="row">Apple Shortcuts — Care Menu, Log Hair Care, Log Hair Retie</th>
                      <td>Provide the entry point and capture hair-care activities for logging.</td>
                    </tr>
                    <tr>
                      <th scope="row">Search Care Logs and Select Latest Log Entry</th>
                      <td>Search Notion results, prepare readable titles with page links and dates, and open the selected record.</td>
                    </tr>
                    <tr>
                      <th scope="row">Hair Care HTTP Request and property helpers</th>
                      <td>Make Notion API requests and read the configured activity, product, image, price, style, condition, and process properties.</td>
                    </tr>
                    <tr>
                      <th scope="row">Notion API and hair-care database</th>
                      <td>Search and store the structured care-log records; the database remains the source of truth.</td>
                    </tr>
                    <tr>
                      <th scope="row">Apple Calendar</th>
                      <td>Provides date-based context for care tracking and review; it is not represented as the log database.</td>
                    </tr>
                    <tr>
                      <th scope="row">Notion integration and property schema</th>
                      <td>Grant access to the required pages and database and keep helper names and data types aligned, without publishing credentials or private IDs.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section id="actions">
              <h2>Shortcut actions</h2>
              <p>The Hair Care Log folder contains these 18 named Shortcuts:</p>
              <ol>
                <li>
                  <strong>Care Menu</strong>
                  {" "}— central user-facing router.
                </li>
                <li>
                  <strong>Log Hair Care</strong>
                  {" "}— records a hair-care activity.
                </li>
                <li>
                  <strong>Log Hair Retie</strong>
                  {" "}— records a retie event.
                </li>
                <li>
                  <strong>Search Care Logs</strong>
                  {" "}— searches existing Notion records.
                </li>
                <li>
                  <strong>Select Latest Log Entry</strong>
                  {" "}— presents recent entries for selection.
                </li>
                <li>
                  <strong>Hair Care HTTP Request</strong>
                  {" "}— centralizes Notion API request behavior.
                </li>
                <li>
                  <strong>Get Care Activity</strong>
                  {" "}— retrieves the activity property.
                </li>
                <li>
                  <strong>Get Products</strong>
                  {" "}— retrieves products associated with a log.
                </li>
                <li>
                  <strong>Get Product Images</strong>
                  {" "}— retrieves product image data.
                </li>
                <li>
                  <strong>Get Product Price</strong>
                  {" "}— retrieves product price data.
                </li>
                <li>
                  <strong>Get Product Type</strong>
                  {" "}— retrieves product type data.
                </li>
                <li>
                  <strong>Add Pros To Product</strong>
                  {" "}— adds product advantages to a record.
                </li>
                <li>
                  <strong>Add Cons To Product</strong>
                  {" "}— adds product drawbacks to a record.
                </li>
                <li>
                  <strong>Get Hair Style</strong>
                  {" "}— retrieves the hair-style property.
                </li>
                <li>
                  <strong>Get Hair Style 2</strong>
                  {" "}— supports a second style value or style branch.
                </li>
                <li>
                  <strong>Get Initial Condition</strong>
                  {" "}— retrieves the starting condition.
                </li>
                <li>
                  <strong>Get Completed Condition</strong>
                  {" "}— retrieves the ending condition.
                </li>
                <li>
                  <strong>Get Process Type</strong>
                  {" "}— retrieves the process classification.
                </li>
              </ol>
            </section>
            <HairLogResponsibilities />
            <section id="benefit">
              <h2>Intended benefit</h2>
              <p>Reduce the cognitive load of maintaining a long-term hair-care record, make previous entries easier to retrieve, and create more consistent data for reviewing products, routines, styles, and outcomes.</p>
            </section>
            <section id="evidence">
              <h2>Evidence &amp; current limits</h2>
              <p>The reviewed workflow documentation establishes the 18-Shortcut structure and the Notion search behavior described here. Public screenshots, exported Shortcuts, synthetic API request and response examples, and the database schema with private identifiers removed have not yet been attached.</p>
              <p className="artifact">Next proof-of-work step: show one new care entry, one Notion search, and retrieval of a previous log while keeping API keys, page IDs, and personal records private.</p>
            </section>
            <ProjectSequenceNav projects={projects} slug="hair-log" next="75-hard-automation" />
          </article>
        </div>
      </div>
    </CaseStudyDocument>
  );
}
