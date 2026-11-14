/** Data-schema section that follows the Aura Logbook architecture diagram. */
export function AuralogbookSchemas() {
  return (
    <>
    <section id="data-sources" className="schema-section" aria-labelledby="schema-heading">
      <h2 id="schema-heading">Relational data and integrations</h2>
      <p>The current .NET data layer uses SQLite through Dapper and versioned SQL migrations in Development and FIT/Staging. The cards summarize the main records and integrations; they are not a complete database schema.</p>
      <div className="schema-map" aria-label="Aura Logbook relational data and integrations">
        <article className="schema-card schema-user">
          <p className="schema-kicker">User-owned record · SQLite</p>
          <h3>User profile</h3>
          <dl>
            <div>
              <dt>Identity</dt>
              <dd>account and secure credential data</dd>
            </div>
            <div>
              <dt>Preferences</dt>
              <dd>display settings and selected pathway</dd>
            </div>
            <div>
              <dt>Context</dt>
              <dd>profile details that personalize reflections</dd>
            </div>
          </dl>
        </article>
        <p className="schema-relationship" aria-label="One user can have many mood entries">
          <span>1 user</span>
          <span aria-hidden="true">→</span>
          <span>many entries</span>
        </p>
        <article className="schema-card schema-mood">
          <p className="schema-kicker">Journal records · SQLite</p>
          <h3>Mood entries</h3>
          <dl>
            <div>
              <dt>Entry</dt>
              <dd>date, reflection, and saved context</dd>
            </div>
            <div>
              <dt>Selected moods</dt>
              <dd>related mood rows per entry</dd>
            </div>
            <div>
              <dt>Updates</dt>
              <dd>entry and mood relationships saved together</dd>
            </div>
          </dl>
        </article>
        <article className="schema-card schema-zodiac">
          <p className="schema-kicker">Personalization · SQLite</p>
          <h3>Pathways and reflections</h3>
          <dl>
            <div>
              <dt>Reference definitions</dt>
              <dd>pathways, moods, aura colors, and their mappings</dd>
            </div>
            <div>
              <dt>Reflection content</dt>
              <dd>prompts, responses, and insight templates</dd>
            </div>
            <div>
              <dt>Presentation</dt>
              <dd>database-backed themes and graphic metadata</dd>
            </div>
          </dl>
        </article>
        <article className="schema-card schema-weather">
          <p className="schema-kicker">Private media and external context</p>
          <h3>Photos and weather</h3>
          <dl>
            <div>
              <dt>Photo metadata</dt>
              <dd>owner and mood-entry relationships in SQLite</dd>
            </div>
            <div>
              <dt>Photo bytes</dt>
              <dd>private storage outside public web assets</dd>
            </div>
            <div>
              <dt>Weather</dt>
              <dd>Open-Meteo context requested by the API</dd>
            </div>
          </dl>
          <p>Photo browsing supports filters, sorting, a saved grid layout, and touch-friendly lightbox navigation.</p>
        </article>
      </div>
      <p className="schema-footnote">Portfolio screenshots use fictional demo content. They do not show a real account or private journal entry.</p>
      <p className="schema-sources">
        <strong>Source evidence:</strong>
        {" "}
        <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Repositories/SqliteMoodRepository.cs">Dapper-backed mood repository</a>
        {" "}·{" "}
        <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Models/User.cs">User model</a>
        {" "}·{" "}
        <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Models/MoodEntry.cs">Mood entry model</a>
        {" "}·{" "}
        <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Data/Database/Migrations/012_private_mood_media.sql">Private media migration</a>
        {" "}·{" "}
        <a href="https://github.com/GemsForge/aura-logbook-api/blob/master/AuraLogbook.Api/Data/Database/Migrations/010_data_driven_reference_configuration.sql">Reference-data migration</a>
      </p>
    </section>
    </>
  );
}
