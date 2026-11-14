import { CaseStudyDocument, CaseStudyHero, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/** Case study page for dynamic-folder-structures; rendered to static HTML by scripts/prepare-pages.mjs. */
export function DynamicFolderStructuresCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument project={project} description="An interactive Apple Shortcut that creates a parent folder and a user-defined set of subfolders.">
      <div className="wrap">
        <CaseStudyHero project={project} />
        <div className="case-layout">
          <aside className="case-nav">
            <nav aria-label="On this project page">
              <p>On this page</p>
              <a href="#problem">A repeatable task worth automating</a>
              <a href="#workflow">How the Shortcut works</a>
              <a href="#evidence">Guide &amp; implementation evidence</a>
              <a href="#validation">Validation &amp; lessons</a>
            </nav>
          </aside>
          <article className="case-content">
            <section id="problem">
              <h2>A repeatable task worth automating</h2>
              <p>Project resources were easier to organize when they started with a clear folder structure. Manually creating a parent folder and multiple issue folders repeated the same setup work each time.</p>
              <p>I built an interactive Apple Shortcut and documented the process so the structure could be created from user inputs.</p>
            </section>
            <section id="workflow">
              <h2>How the Shortcut works</h2>
              <ol>
                <li>
                  <strong>Format the date, if useful.</strong>
                  {" "}Prepare a date value for the naming convention.
                </li>
                <li>
                  <strong>Ask for the main folder name.</strong>
                  {" "}Store the text input in a variable.
                </li>
                <li>
                  <strong>Create the parent folder.</strong>
                  {" "}Keep its returned folder reference for subsequent actions.
                </li>
                <li>
                  <strong>Ask how many subfolders are needed.</strong>
                  {" "}Use the numeric input as the repeat count.
                </li>
                <li>
                  <strong>Repeat the creation step.</strong>
                  {" "}Ask for each name and create the subfolder inside the stored parent.
                </li>
              </ol>
              <h3>The detail that makes it work</h3>
              <p>The repeated action must use the correct parent folder reference. My guide calls out this dependency when troubleshooting “Unspecified Path” errors.</p>
            </section>
            <section id="evidence">
              <h2>Guide &amp; implementation evidence</h2>
              <p>The original guide includes action screenshots, a complete-flow overview, and a comparison of manual and automated setup.</p>
              <a className="button secondary" href="https://gemsforge.notion.site/Guide-to-Creating-Dynamic-Folder-Structures-in-Apple-Shortcuts-13baeadaba7780d4a09eda95b61891b7">Read the original illustrated guide ↗</a>
              <pre className="code">
                <code>
      {`Example inputs
Parent: Demo Sprint
Subfolders: 2
Names: Issue A, Issue B

Expected output
Demo Sprint/
  Issue A/
  Issue B/`}
                </code>
              </pre>
              <p>The example above illustrates the intended output; it is not a captured execution result.</p>
            </section>
            <section id="validation">
              <h2>Validation &amp; lessons</h2>
              <p>The documented validation checks that the parent folder is created, the requested number of subfolders is generated, and each is nested under the correct parent with the supplied name.</p>
              <p>Test in a temporary directory before adapting the workflow to real project files. The guide demonstrates variables, repeat control flow, path management, and technical communication without claiming a measured time-saving result.</p>
            </section>
            <ProjectSequenceNav projects={projects} slug="dynamic-folder-structures" next="notion-api-shortcuts" />
          </article>
        </div>
      </div>
    </CaseStudyDocument>
  );
}
