/** Architecture diagram section injected into the Aura Logbook case study. */
export function AuralogbookArchitecture() {
  return (
    <>
    <section id="architecture" className="architecture architecture-component" aria-label="Aura Logbook architecture">
      <h2>Architecture and service boundaries</h2>
      <p>The diagram shows how the clients, authenticated API, SQLite repositories, private photo storage, and external services connect.</p>
      <figure className="architecture-figure">
        <button className="architecture-open" type="button" aria-haspopup="dialog" aria-controls="architecture-dialog" aria-label="Open the architecture diagram larger">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.5" />
            <path d="m16 16 5 5M10.8 7.5v6.6M7.5 10.8h6.6" />
          </svg>
          {" "}
          <span>Zoom</span>
        </button>
        {" "}
        <img className="architecture-image" src="/assets/aura-logbook-architecture.svg" alt="Aura Logbook phone-first product journey and data flow: responsive React web client with desktop companion, JWT sign-in, check-ins saved through the .NET 9 API and Dapper repositories to SQLite in Development and FIT/Staging, optional private photo storage with linked attachment metadata, and a React Native + Expo navigation foundation for Today, Log, Journal, and Profile." aria-describedby="architecture-tech-list" width="2600" height="1940" loading="lazy" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Click to zoom the Aura Logbook architecture diagram" />
        {" "}
        <ul className="sr-only" id="architecture-tech-list" aria-label="Technology dependency labels">
          <li>React and TypeScript web client with responsive phone and desktop layouts.</li>
          <li>React Native and Expo navigation foundation with Today, Log, Journal, and Profile destinations.</li>
          <li>Material UI, Joy UI, React Router, Redux Toolkit, RTK Query, and Axios.</li>
          <li>.NET 9 API with JWT authentication, injected services, and user-scoped routes.</li>
          <li>SQLite persistence through Dapper repositories and versioned SQL migrations for Development and FIT/Staging.</li>
          <li>Database-backed mood, aura, pathway, reflection, and insight definitions.</li>
          <li>Private photo attachment metadata with photo bytes outside public web assets.</li>
          <li>Open-Meteo REST API for contextual weather.</li>
        </ul>
        <figcaption>
          <button className="architecture-text-open" type="button" aria-haspopup="dialog" aria-controls="architecture-dialog">Click to zoom</button>
          <span>{" "}· Application flow, service boundaries, data sources, and dependencies shown for Development and FIT/Staging; Production repository selections differ.</span>
        </figcaption>
      </figure>
      <dialog className="architecture-dialog" id="architecture-dialog" aria-label="Aura Logbook architecture diagram, enlarged">
        <div className="architecture-dialog-bar">
          <span>Architecture diagram</span>
          {" "}
          <button className="architecture-close" type="button" aria-label="Close enlarged diagram">
            Close{" "}
            <kbd>Esc</kbd>
          </button>
        </div>
        <div className="architecture-zoom-area" tabIndex={0} aria-label="Move the pointer over the diagram to zoom the whole image around that point">
          <img src="/assets/aura-logbook-architecture.svg" alt="Enlarged Aura Logbook phone-first product journey and data flow diagram" width="2600" height="1940" />
        </div>
      </dialog>
      <script src="/assets/architecture-diagram.js" defer />
    </section>
    </>
  );
}
