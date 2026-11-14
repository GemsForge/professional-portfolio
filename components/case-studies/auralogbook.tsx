import { CaseStudyDocument, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";
import { AuralogbookArchitecture } from "./auralogbook-architecture.tsx";
import { AuralogbookSchemas } from "./auralogbook-schemas.tsx";

/**
 * Aura Logbook case study. Unlike the other case studies it keeps the #131 dark
 * story hero, loads its image-dialog assets, and composes the architecture and
 * schema sections. Name, pre-title, and lead still come from the catalog.
 */
export function AuralogbookCaseStudy({ project, projects }: CaseStudyProps) {
  return (
    <CaseStudyDocument
      project={project}
      description="Full-stack Aura Logbook case study by Diamond Brown. Explore the React and TypeScript client, React Native shell, .NET API, SQLite data layer, architecture, and source code."
      // The query string busts caches for the recruiter-first case study styles.
      siteStylesheet="/assets/site.css?v=auralogbook-recruiter-case-20261112"
      stylesheets={["/assets/auralogbook-image-dialog.css", "/assets/redesign.css"]}
      scripts={["/assets/projects-redesign.js", "/assets/auralogbook-image-dialog.js"]}
      bodyClassName="rd"
    >
      {/* #131 redesign: dark story hero leads with real phone screens, then the recruiter snapshot and detail. */}
      <section className="rd-hero">
        <div className="wrap rd-hero-grid">
          <div className="pagehero">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/portfolio/">Portfolio</a>
              {" "}/{" "}
              <a href="/portfolio/projects/">Projects</a>
              {" "}/{" "}
              <span aria-current="page">{project.name}</span>
            </nav>
            <div className="case-banner aura-case-banner">
              <div>
                <div className="eyebrow">{project.preTitle}</div>
                <div className="case-brand-title">
                  <img src="/assets/auralogbook-tour/aura-logbook-approved.webp" alt="" aria-hidden="true" width="88" height="88" />
                  {" "}
                  <h1>{project.name}</h1>
                </div>
                <p className="lead">{project.description}</p>
                <div className="facts">
                  <div data-dependency-group="portfolioHighlights" />
                </div>
                <div className="actions case-project-actions">
                  <a className="button" href="https://github.com/GemsForge/aura-logbook-api">View source on GitHub ↗</a>
                  {" "}
                  <a className="button secondary" href="#screens">Browse app screens</a>
                </div>
                <dl className="rd-stats" aria-label="Project at a glance">
                  <div>
                    <dt>React web + Expo shell</dt>
                    <dd>2 clients</dd>
                  </div>
                  <div>
                    <dt>API on Dapper and SQLite</dt>
                    <dd>.NET 9</dd>
                  </div>
                  <div>
                    <dt>Spotify OAuth, tokens kept in the API</dt>
                    <dd>PKCE</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          {/* Story-style screen carousel; projects-redesign.js adds progress bars and autoplay with a pause control. */}
          <section className="rd-story" data-story="" aria-roledescription="carousel" aria-label="Aura Logbook phone screens">
            <ul hidden>
              <li data-story-slide="" data-src="/assets/auralogbook-tour/home-mobile.png" data-alt="Aura Logbook home screen on a phone with the daily mood check-in" data-title="Home" data-detail="daily check-in" />
              <li data-story-slide="" data-src="/assets/auralogbook-tour/check-in-mobile-top.png" data-alt="Aura Logbook mood check-in on a phone" data-title="Check in" data-detail="moods and detail" />
              <li data-story-slide="" data-src="/assets/auralogbook-tour/reflections-mobile.png" data-alt="Saved Aura Logbook reflections on a phone" data-title="Reflections" data-detail="saved entries" />
              <li data-story-slide="" data-src="/assets/auralogbook-tour/insights-mobile.png" data-alt="Aura Logbook mood insights on a phone" data-title="Insights" data-detail="patterns over time" />
            </ul>
            <div className="rd-story-bars" data-story-bars="" />
            <figure className="rd-story-frame">
              <img data-story-image="" src="/assets/auralogbook-tour/home-mobile.png" alt="Aura Logbook home screen on a phone with the daily mood check-in" width="332" height="720" />
            </figure>
            <div className="rd-story-caption">
              <span data-story-caption="" aria-live="off">
                <strong>Home</strong>
                {" "}· daily check-in
              </span>
              <button className="rd-story-toggle" type="button" data-story-toggle="" hidden>Pause</button>
            </div>
          </section>
        </div>
      </section>
      <div className="wrap rd-case-body">
        {/* Recruiter scan order: role, stack, system boundaries, then detailed evidence. */}
        <section className="project-snapshot" aria-labelledby="project-snapshot-heading">
          <div>
            <h2 id="project-snapshot-heading">Project snapshot</h2>
            <dl className="project-snapshot-facts">
              <div>
                <dt>Role</dt>
                <dd>Product design and full-stack development</dd>
              </div>
              <div>
                <dt>Clients</dt>
                <dd>React 19, TypeScript, React Native, Expo</dd>
              </div>
              <div>
                <dt>API and data</dt>
                <dd>C#, .NET 9, SQLite, Dapper, SQL migrations</dd>
              </div>
              <div>
                <dt>System concerns</dt>
                <dd>Authentication, user-scoped data, private media, Spotify OAuth</dd>
              </div>
            </dl>
          </div>
          <p className="project-status">
            <strong>Status</strong>
            <span>Independent project in development</span>
          </p>
        </section>
        <div className="case-layout">
          <aside className="case-nav">
            <nav aria-label="On this project page">
              <p>On this page</p>
              {" "}
              <a href="#problem">Project goals</a>
              {" "}
              <a href="#implementation">Technical approach</a>
              {" "}
              <a href="#architecture">Architecture</a>
              {" "}
              <a href="#data-sources">Data model and integrations</a>
              {" "}
              <a href="#screens">Product screens</a>
              {" "}
              <a href="#journey">Core user flow</a>
              {" "}
              <a href="#evidence">Source evidence</a>
            </nav>
          </aside>
          <article className="case-content">
            <section id="problem">
              <h2>Product goals and my contribution</h2>
              <p>Aura Logbook is a private reflection journal designed for quick phone check-ins and useful review over time. I shaped the product and built its responsive web client, React Native navigation shell, and .NET API.</p>
              <p>The engineering work connects authenticated user journeys to mood records, reflections, insights, private photo access, and configurable content. The optional Spotify connection adds listening context while playback stays in Spotify.</p>
              <p className="project-boundary">
                <strong>Product boundary:</strong>
                {" "}Aura supports personal reflection. It is not a diagnostic or treatment tool.
              </p>
            </section>
            <section id="implementation">
              <h2>Technical approach</h2>
              <div className="engineering-highlights">
                <article>
                  <h3>Client delivery</h3>
                  <p>The React 19 and TypeScript web client supports responsive phone and desktop layouts with Material UI, Joy UI, Redux Toolkit, RTK Query, React Router, Axios, and Recharts. A React Native/Expo shell organizes the native destinations.</p>
                </article>
                <article>
                  <h3>API and persistence</h3>
                  <p>The .NET 9 API separates controllers, injected services, and user-scoped routes. Dapper repositories and versioned SQL migrations persist journal data in SQLite for Development and FIT/Staging.</p>
                </article>
                <article>
                  <h3>Identity and integrations</h3>
                  <p>JWT-protected workflows scope journal and private-media access to the signed-in user. Spotify linking uses OAuth Authorization Code with PKCE; encrypted tokens stay in the API, while the client receives playback and playlist metadata.</p>
                </article>
                <article>
                  <h3>Configurable product data</h3>
                  <p>Database-backed definitions keep pathways, moods, colors, prompts, and presentation settings configurable. A debug-only endpoint provides sample entries for development.</p>
                </article>
              </div>
              <aside className="note engineering-verification">
                <p>
                  <strong>Verification evidence:</strong>
                  {" "}the repositories include Vitest and Testing Library checks for the web client, plus xUnit and Moq tests for the API. The links below show test coverage exists; they do not claim every suite has passed.
                </p>
              </aside>
            </section>
            {/* Architecture diagram and schema section are injected from adjacent source fragments. */}
            <AuralogbookArchitecture />
            <AuralogbookSchemas />
            <section id="screens" aria-labelledby="screens-heading">
              <h2 id="screens-heading">Product screens</h2>
              <p>Review the public entry point, sign-in, check-in, history, gallery, insights, appearance settings, and Spotify connection. Each image pairs a real React web screen with its phone or desktop companion. Open an image for a closer look. Captures use fictional demo data; the React Native/Expo navigation shell is described separately.</p>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Public home" data-image-src="/assets/auralogbook-tour/public-home-pair.png" data-image-alt="Aura Logbook public landing screen on a phone with the desktop layout alongside" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook public landing screen and desktop view for a closer look">
                  <img src="/assets/auralogbook-tour/public-home-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Public home · A clear introduction to the reflection experience on phone and desktop.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Sign in" data-image-src="/assets/auralogbook-tour/login-pair.png" data-image-alt="Aura Logbook sign-in screen on a phone in front of its desktop layout" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook sign-in screen and desktop layout for a closer look">
                  <img src="/assets/auralogbook-tour/login-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Sign in · The refreshed entry screen adapts from phone to desktop.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Home" data-image-src="/assets/auralogbook-tour/home-pair.png" data-image-alt="Aura Logbook home screen on a phone in front of its desktop dashboard" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook home screen and desktop dashboard for a closer look">
                  <img src="/assets/auralogbook-tour/home-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Home · A calm starting point for the day’s check-in and reflection.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Check in" data-image-src="/assets/auralogbook-tour/check-in-pair.png" data-image-alt="Mood check-in on a phone with the desktop experience alongside" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook mood check-in and desktop experience for a closer look">
                  <img src="/assets/auralogbook-tour/check-in-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Check in · Choose a mood and write a short reflection.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="History" data-image-src="/assets/auralogbook-tour/reflections-pair.png" data-image-alt="Saved reflections on a phone with the desktop history view alongside" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook reflection history and desktop view for a closer look">
                  <img src="/assets/auralogbook-tour/reflections-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>History · Revisit saved entries across both screen sizes.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Individual reflection" data-image-src="/assets/auralogbook-tour/individual-record-pair.png" data-image-alt="An individual photo-backed reflection on a phone beside its desktop view, with its weather snapshot" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open an individual Aura Logbook reflection and desktop view for a closer look">
                  <img src="/assets/auralogbook-tour/individual-record-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Individual reflection: review a saved thought, its photos, and captured context.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Photo gallery" data-image-src="/assets/auralogbook-tour/gallery-pair.png" data-image-alt="Aura Logbook private photo gallery with nine sample photos on a phone and desktop" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook photo gallery and desktop view for a closer look">
                  <img src="/assets/auralogbook-tour/gallery-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Gallery: browse generated sample photos linked to fictional journal entries.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Insights" data-image-src="/assets/auralogbook-tour/insights-pair.png" data-image-alt="Mood insights on a phone with the desktop analytics view alongside" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook mood insights and desktop analytics for a closer look">
                  <img src="/assets/auralogbook-tour/insights-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Insights: compare reflection patterns on phone and desktop.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Appearance selector in Light mode" data-image-src="/assets/auralogbook-tour/appearance-pair.png" data-image-alt="Aura Logbook in Light mode with the Light, Dark, and Use device setting appearance selector open on phone and desktop" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook appearance selector and desktop view for a closer look">
                  <img src="/assets/auralogbook-tour/appearance-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Appearance: choose Light, Dark, or the device setting.</figcaption>
              </figure>
              <figure>
                <button className="aura-image-trigger" type="button" data-aura-image-trigger="" data-image-title="Spotify integration" data-image-src="/assets/auralogbook-tour/spotify-pair.png" data-image-alt="Aura Logbook Spotify panel on phone and desktop showing Frontline by Butcher Brown with Discover Weekly, daylist, and Your Summer Rewind" aria-haspopup="dialog" aria-controls="aura-image-dialog" aria-label="Open the Aura Logbook Spotify panel and desktop view for a closer look">
                  <img src="/assets/auralogbook-tour/spotify-pair.png" alt="" width="1600" height="1100" loading="lazy" />
                </button>
                {" "}
                <figcaption>Spotify: show playback and playlist context without handling audio playback.</figcaption>
              </figure>
            </section>
            <dialog id="aura-image-dialog" className="aura-image-dialog" aria-labelledby="aura-image-dialog-title" aria-describedby="aura-image-dialog-help">
              <div className="aura-image-dialog-bar">
                <span id="aura-image-dialog-title">Aura Logbook screen</span>
                {" "}
                <button className="aura-image-dialog-close" type="button" data-aura-image-close="">
                  Close{" "}
                  <kbd>Esc</kbd>
                </button>
              </div>
              <p className="aura-image-dialog-help" id="aura-image-dialog-help">Swipe sideways to explore the phone and desktop views.</p>
              <div className="aura-image-dialog-viewport" tabIndex={0} aria-label="Enlarged Aura Logbook screen. Swipe or scroll sideways to view the full image.">
                <img id="aura-image-dialog-preview" alt="" width="1600" height="1100" />
              </div>
            </dialog>
            <section id="journey" aria-labelledby="journey-heading">
              <h2 id="journey-heading">Core user flow</h2>
              <p>The main workflow connects account access, daily entries, saved history, and reflection insights.</p>
              <ol className="mood-workflow">
                <li>
                  <h3>Register or sign in</h3>
                  <p>Authenticate before entering personal journal data.</p>
                </li>
                <li>
                  <h3>Record a check-in</h3>
                  <p>Save a date, one or more moods, and an optional reflection.</p>
                </li>
                <li>
                  <h3>Review saved entries</h3>
                  <p>Browse by date range, then update or delete an entry.</p>
                </li>
                <li>
                  <h3>Explore patterns</h3>
                  <p>Use summaries, charts, and pathway-specific reflection content.</p>
                </li>
              </ol>
              <p className="workflow-context">The React Native/Expo navigation shell organizes Today, Log, Journal, and Profile. The paired captures show the responsive React web client.</p>
            </section>
            <section id="evidence">
              <h2>Source evidence</h2>
              <p>Use these entry points to trace the API, data access, client routing, and tests behind the project.</p>
              <ul>
                <li>
                  <strong>API boundaries:</strong>
                  {" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Controllers/MoodController.cs">mood endpoints</a>
                  ,{" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Controllers/AuthController.cs">authentication endpoints</a>
                </li>
                <li>
                  <strong>Persistence:</strong>
                  {" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Repositories/SqliteMoodRepository.cs">Dapper mood repository</a>
                  ,{" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Repositories/SqliteUserRepository.cs">user repository</a>
                  ,{" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/tree/master/AuraLogbook.Api/Data/Database/Migrations">versioned migrations</a>
                </li>
                <li>
                  <strong>Client:</strong>
                  {" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/aura-ui/src/App.tsx">session restoration and routing</a>
                  ,{" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/tree/master/aura-ui">React client</a>
                  ,{" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/docs/ux/mobile-shell.md">native shell notes</a>
                </li>
                <li>
                  <strong>Tests:</strong>
                  {" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api.Tests/MoodServiceTests.cs">API service tests</a>
                  ,{" "}
                  <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/aura-ui/src/pages/tests/MoodEntryForm.test.tsx">client workflow tests</a>
                </li>
              </ul>
            </section>
            <ProjectSequenceNav projects={projects} slug="auralogbook" next="apple-ecosystem" />
          </article>
        </div>
      </div>
    </CaseStudyDocument>
  );
}
