import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/** Case study page for apple-ecosystem; rendered to static HTML by scripts/prepare-pages.mjs. */
export function AppleEcosystemCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description="Redesigning a mixed productivity setup into a coordinated Apple-native system for knowledge, data, tasks, and automation.">
      <div className="wrap">
        <CaseStudyHero project={project} />
        <div className="case-layout">
          <aside className="case-nav">
            <nav aria-label="On this project page">
              <p>On this page</p>
              <a href="#problem">The system behind everyday work</a>
              <a href="#architecture">Give every tool a defined role</a>
              <a href="#decisions">Design decisions that mattered</a>
              <a href="#evidence">Evidence &amp; continued refinement</a>
            </nav>
          </aside>
          <article className="case-content">
            <section id="problem">
              <h2>The system behind everyday work</h2>
              <p>Information was distributed across overlapping productivity tools. Moving to Apple required more than copying notes: the system needed clear ownership for knowledge, structured data, files, tasks, and schedules.</p>
              <p>
                <strong>My contribution:</strong>
                {" "}workflow analysis, architecture, registries, standards, migration, reusable templates, and automation.
              </p>
            </section>
            <section id="architecture">
              <h2>Give every tool a defined role</h2>
              <div className="table-scroll">
                <table className="toolmap">
                  <caption>Apple-native system responsibilities</caption>
                  <thead>
                    <tr>
                      <th scope="col">Tool</th>
                      <th scope="col">Responsibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Apple Notes</th>
                      <td>Knowledge, reference material, and the Guide to GEM Life</td>
                    </tr>
                    <tr>
                      <th scope="row">Numbers</th>
                      <td>Registries, structured records, expenses, and dashboards</td>
                    </tr>
                    <tr>
                      <th scope="row">Reminders</th>
                      <td>Tasks, recurring routines, and work queues</td>
                    </tr>
                    <tr>
                      <th scope="row">Calendar</th>
                      <td>Time-based commitments and scheduling</td>
                    </tr>
                    <tr>
                      <th scope="row">Shortcuts &amp; Siri</th>
                      <td>Structured capture, retrieval, and repeatable automation</td>
                    </tr>
                    <tr>
                      <th scope="row">Freeform &amp; iCloud</th>
                      <td>Visual exploration and file storage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3>Separate content from metadata</h3>
              <p>The Manual Registry uses stable identifiers, parent-child relationships, record types, navigation references, and statuses. The Tag Registry defines controlled names and classes. This makes the structure explicit instead of leaving it buried in individual notes.</p>
            </section>
            <section id="decisions">
              <h2>Design decisions that mattered</h2>
              <ul>
                <li>
                  <strong>Choose tools by responsibility:</strong>
                  {" "}use structured tables for data and notes for reference content.
                </li>
                <li>
                  <strong>Preserve meaning during migration:</strong>
                  {" "}account for relationships, metadata, and navigation alongside text.
                </li>
                <li>
                  <strong>Standardize recurring work:</strong>
                  {" "}use templates, naming conventions, controlled fields, and reusable documentation.
                </li>
                <li>
                  <strong>Automate after understanding:</strong>
                  {" "}make the workflow visible before adding another shortcut.
                </li>
              </ul>
              <p>The expense-tracking portion uses XLOOKUP, COUNTIFS, pivot tables, and monthly snapshots. Dictionary-based Shortcuts support structured personal-reference retrieval.</p>
            </section>
            <section id="evidence">
              <h2>Evidence &amp; continued refinement</h2>
              <p>This overview is grounded in my documented independent systems work. Redacted registry samples and a guided system walkthrough are not yet published.</p>
              <p>Useful next artifacts are a before/after architecture map, a sample parent-child registry, and one task traced from capture through retrieval. Scaffolding Shortcuts will be described in detail after their implementation is reviewed.</p>
              <div className="note">
                <p>
                  <strong>An evolving system.</strong>
                  {" "}The aim is maintainability and practical use; no measured productivity or subscription-savings figure is claimed here.
                </p>
              </div>
            </section>
            <ProjectSequenceNav projects={projects} slug="apple-ecosystem" next="dynamic-folder-structures" />
          </article>
        </div>
      </div>
    </CaseStudyDocument>
  );
}
