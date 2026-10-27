"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { siDotnet, siGithub, siPostgresql, siReact, siRedux, siSqlite, siTypescript } from "simple-icons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { KnowledgeResource } from "@/lib/knowledge-types";

type LibraryFolder = {
  path: string;
  label: string;
  group: "handbooks" | "governance" | "delivery" | "assets";
  description: string;
};

/** Names the four separately addressable areas of the owner library. */
export type KnowledgeModule = "handbooks" | "governance" | "delivery" | "assets";

type HandbookCategory = "architecture" | "backend" | "data" | "project" | "codex" | "quality";

type HandbookReference = {
  folder: string;
  filename: string;
};

/** Keeps the landing-page handbook cards and their private library files aligned. */
type Handbook = {
  title: string;
  category: HandbookCategory;
  categoryLabel: string;
  description: string;
  tags: string[];
  searchText: string;
  html: HandbookReference;
  markdown: HandbookReference;
};

/** Uses saved library logos first, then bundled Simple Icons when available. */
function HandbookTechnologyIcon({ tag }: { tag: string }) {
  const savedLogos: Record<string, string> = {
    OpenAPI: "/assets/auralogbook-stack/swagger.png",
    React: "/assets/auralogbook-stack/react.png",
    Redux: "/assets/auralogbook-stack/redux.png",
    SQLite: "/assets/auralogbook-stack/sqlite.png",
    TypeScript: "/assets/auralogbook-stack/typescript.png",
  };
  if (savedLogos[tag]) return <img alt="" aria-hidden="true" className="dependency-chip-logo" src={savedLogos[tag]} />;
  const icons = {
    "ASP.NET Core": siDotnet,
    GitHub: siGithub,
    PostgreSQL: siPostgresql,
    React: siReact,
    Redux: siRedux,
    SQLite: siSqlite,
    TypeScript: siTypescript,
  };
  const icon = icons[tag];
  return icon ? (
    <svg aria-hidden="true" className="dependency-chip-logo" focusable="false" role="img" viewBox="0 0 24 24">
      <path d={icon.path} />
    </svg>
  ) : null;
}

const folders: LibraryFolder[] = [
  { path: "handbooks/architecture", label: "Architecture", group: "handbooks", description: "System structure and feature-oriented application design." },
  { path: "handbooks/backend", label: "Backend", group: "handbooks", description: "API, service, and microservice engineering." },
  { path: "handbooks/data", label: "Data", group: "handbooks", description: "Database engineering, schemas, and testing." },
  { path: "handbooks/codex", label: "Codex", group: "handbooks", description: "Development workflows and Codex reference guides." },
  { path: "handbooks/project-management", label: "Project management", group: "handbooks", description: "GitHub Projects and project delivery practices." },
  { path: "handbooks/quality", label: "Quality", group: "handbooks", description: "Testing, QA, and verification." },
  { path: "governance", label: "Governance and standards", group: "governance", description: "Coding, accessibility, operating, and source-of-truth guidance." },
  { path: "governance/templates/ci", label: "CI templates", group: "governance", description: "Reusable workflow templates and repository policy examples." },
  { path: "governance/templates/development", label: "Development templates", group: "governance", description: "Checkpoint and sprint delivery templates." },
  { path: "delivery", label: "Delivery references", group: "delivery", description: "Definition of Done, development checkpoints, and sprint reports." },
  { path: "assets/logos", label: "Tool and brand logos", group: "assets", description: "Technology marks used in developer reference materials." },
];

const sections = [
  { id: "handbooks", title: "Handbooks", description: "Long-form guides grouped by the work they support." },
  { id: "governance", title: "Governance", description: "Shared standards, policies, and reusable ways of working." },
  { id: "delivery", title: "Delivery", description: "Definition of Done, development checkpoints, and sprint delivery resources." },
  { id: "assets", title: "Assets", description: "Tool and brand logos used throughout the developer reference library." },
] satisfies { id: KnowledgeModule; title: string; description: string }[];

const handbookCategories: { id: HandbookCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "architecture", label: "Architecture" },
  { id: "backend", label: "Backend" },
  { id: "data", label: "Data" },
  { id: "project", label: "Project management" },
  { id: "codex", label: "Codex" },
  { id: "quality", label: "Quality" },
];

const handbooks: Handbook[] = [
  {
    title: "Console Feature-Oriented Layered UI Architecture",
    category: "architecture",
    categoryLabel: "Architecture",
    description: "Feature boundaries, reusable views, workflows, query state, routing, forms, and role-oriented file names.",
    tags: ["React", "TypeScript", "TanStack Query"],
    searchText: "console feature oriented layered ui architecture react typescript tanstack query",
    html: { folder: "handbooks/architecture", filename: "console-feature-oriented-layered-ui-architecture-booklet.html" },
    markdown: { folder: "handbooks/architecture", filename: "Console Feature-Oriented Layered UI Architecture.md" },
  },
  {
    title: "Backend API and Microservices Engineering",
    category: "backend",
    categoryLabel: "Backend",
    description: "Contracts, layers, API boundaries, microservice distinctions, security, errors, testing, documentation, and MVP practice.",
    tags: ["ASP.NET Core", "Vapor", "OpenAPI"],
    searchText: "backend api microservices engineering swift vapor fluent c sharp dotnet asp net node typescript openapi security",
    html: { folder: "handbooks/backend", filename: "backend-api-microservices-engineering-handbook.html" },
    markdown: { folder: "handbooks/backend", filename: "backend-api-microservices-engineering-handbook.md" },
  },
  {
    title: "Database Engineering Handbook",
    category: "data",
    categoryLabel: "Data",
    description: "Schema design, table criteria, SQL portability, migrations, integrity, ERDs, backups, recovery, and tests.",
    tags: ["SQLite", "PostgreSQL", "ERD"],
    searchText: "database engineering sqlite postgresql mysql fluent migrations erd schema sql",
    html: { folder: "handbooks/data", filename: "database-engineering-handbook-booklet.html" },
    markdown: { folder: "handbooks/data", filename: "database-engineering-handbook.md" },
  },
  {
    title: "Database Testing Handbook",
    category: "data",
    categoryLabel: "Data quality",
    description: "Foreign keys, migrations, rollback, query mapping, compatibility, fixtures, ERD verification, and restore testing.",
    tags: ["SQLite", "PostgreSQL", "Migrations"],
    searchText: "database testing sqlite postgresql migrations foreign keys fixtures erd backup restore",
    html: { folder: "handbooks/data", filename: "database-testing-handbook.html" },
    markdown: { folder: "handbooks/data", filename: "database-testing-handbook.md" },
  },
  {
    title: "GitHub Project Management Handbook",
    category: "project",
    categoryLabel: "Project management",
    description: "Repository setup, Scrum boards, commit policy, protected branches, labels, issue writing, and MVP stories.",
    tags: ["GitHub", "Scrum", "MVP"],
    searchText: "github project management scrum board labels issues pull requests mvp stories",
    html: { folder: "handbooks/project-management", filename: "github-project-management-handbook.html" },
    markdown: { folder: "handbooks/project-management", filename: "github-project-management-handbook.md" },
  },
  {
    title: "Codex Development Handbook",
    category: "codex",
    categoryLabel: "Codex",
    description: "Instructions, agents, subagents, prompts, tools, projects, chats, automations, safety, and evidence.",
    tags: ["Codex", "ChatGPT", "Automation"],
    searchText: "codex chatgpt agents subagents projects chats automations terminal cli ide instructions",
    html: { folder: "handbooks/codex", filename: "codex-development-handbook.html" },
    markdown: { folder: "handbooks/codex", filename: "codex-development-handbook.md" },
  },
  {
    title: "Testing and QA Handbook",
    category: "quality",
    categoryLabel: "Quality",
    description: "API versus UI testing, developer and QA roles, good and bad tests, regression risk, and quality evidence.",
    tags: ["Testing", "QA", "Playwright"],
    searchText: "testing qa api ui developer tests good bad tests quality accessibility regression integration end to end",
    html: { folder: "handbooks/quality", filename: "testing-and-qa-handbook.html" },
    markdown: { folder: "handbooks/quality", filename: "testing-and-qa-handbook.md" },
  },
];

const shelfReferences: {
  id: "governance" | "delivery";
  title: string;
  description: string;
  items: { title: string; resourceTitle: string }[];
}[] = [
  {
    id: "governance",
    title: "🧭 Governance shelf",
    description: "Shared standards and reusable ways of working.",
    items: [
      { title: "Technology and coding standards", resourceTitle: "Technology and coding standards" },
      { title: "💎 GemsForge coding preferences", resourceTitle: "GemsForge coding preferences" },
      { title: "📌 Knowledge base source of truth", resourceTitle: "Knowledge base source of truth" },
      { title: "Accessibility and responsive standards", resourceTitle: "Accessibility and responsive standards" },
      { title: "React and Redux best practices", resourceTitle: "React and Redux best practices" },
      { title: "GitHub Actions standard", resourceTitle: "GitHub Actions standard" },
      { title: "Portable GitHub development policy kit", resourceTitle: "Portable GitHub development policy kit" },
      { title: "Knowledge base TODO", resourceTitle: "Knowledge base TODO" },
    ],
  },
  {
    id: "delivery",
    title: "✅ Delivery references",
    description: "Checklists and templates for delivering work consistently.",
    items: [
      { title: "Definition of Done", resourceTitle: "Definition of Done" },
      { title: "Development checkpoint template", resourceTitle: "Development checkpoint template" },
      { title: "Sprint delivery report template", resourceTitle: "Sprint delivery report template" },
      { title: "GemsForge Development Operating Standard", resourceTitle: "GemsForge Development Operating Standard" },
    ],
  },
];

/** Builds the owner-gated route used to read stored HTML and Markdown references. */
function readerHref(resourceId: string) {
  return `/admin/knowledge/read?id=${encodeURIComponent(resourceId)}`;
}

/** Owns a private library module page, its folder filtering, search, and upload interaction. */
export function KnowledgeDirectory({ initialModule, initialFolder }: {
  /** Selects a dedicated module page; omit it to render the module index. */
  initialModule?: KnowledgeModule;
  /** Optionally narrows a module page to one of its folders. */
  initialFolder?: string;
}) {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [activeFolder] = useState<string | null>(
    folders.some((folder) => folder.path === initialFolder && (!initialModule || folder.group === initialModule))
      ? initialFolder!
      : null,
  );
  const [search, setSearch] = useState("");
  const [handbookSearch, setHandbookSearch] = useState("");
  const [activeHandbookCategory, setActiveHandbookCategory] = useState<HandbookCategory | "all">("all");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadResources = useCallback(async () => {
    const response = await fetch("/api/knowledge", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not load your references. Refresh the page and try again.");
    const data = (await response.json()) as { resources?: KnowledgeResource[] };
    setResources(Array.isArray(data.resources) ? data.resources : []);
  }, []);

  useEffect(() => {
    async function fetchResources() {
      try {
        await loadResources();
      } catch (error) {
        setIsError(true);
        setMessage(error instanceof Error ? error.message : "Could not load your references.");
      } finally {
        setIsLoading(false);
      }
    }
    void fetchResources();
  }, [loadResources]);

  const selectedFolder = folders.find((folder) => folder.path === activeFolder);
  const activeModule = sections.find((section) => section.id === initialModule);
  const moduleFolders = folders.filter((folder) => folder.group === initialModule);
  const moduleResources = initialModule
    ? resources.filter((resource) => folders.some((folder) => folder.group === initialModule && folder.path === resource.folder))
    : [];
  const folderResources = selectedFolder
    ? resources.filter((resource) => resource.folder === selectedFolder.path)
    : initialModule
      ? moduleResources
      : resources;
  const visibleResources = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return folderResources.filter((resource) =>
      [resource.title, resource.folder, resource.filename].some((value) => value.toLocaleLowerCase().includes(query)),
    );
  }, [folderResources, search]);
  /** Applies the landing-page category and text filters without altering the source list. */
  const visibleHandbooks = useMemo(() => {
    const query = handbookSearch.trim().toLocaleLowerCase();
    return handbooks.filter((handbook) =>
      (activeHandbookCategory === "all" || handbook.category === activeHandbookCategory) &&
      (!query || `${handbook.title} ${handbook.description} ${handbook.searchText} ${handbook.tags.join(" ")}`.toLocaleLowerCase().includes(query)),
    );
  }, [activeHandbookCategory, handbookSearch]);

  /** Finds an uploaded handbook edition by its module folder and original filename. */
  function findHandbookReference(reference: HandbookReference) {
    return resources.find((resource) => resource.folder === reference.folder && resource.filename === reference.filename);
  }

  async function addReference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setIsError(false);
    setMessage("Adding reference…");
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        body: new FormData(form),
        cache: "no-store",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save this reference.");
      form.reset();
      await loadResources();
      setMessage("Reference added to your library.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Could not save this reference.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader pathname="/admin/knowledge/" />
      <main id="main" className="wrap knowledge-page">
        <div className="pagehero library-intro">
          <div className="eyebrow">Owner workspace · Private library</div>
          <h1>{activeModule ? activeModule.title : "GemsForge Developer Library"}</h1>
          <p className="lead">{activeModule ? activeModule.description : "Build with intention. Keep the map. A private home for the handbooks, standards, and delivery references that support your work."}</p>
          {activeModule ? (
            <nav className="library-links" aria-label="Module navigation">
              <Link className="button secondary" href="/admin/knowledge/">← All modules</Link>
              <a className="button" href="#saved-references">Browse saved references</a>
              <a className="button secondary" href="#manage-references">Add a reference</a>
            </nav>
          ) : (
            <nav className="library-links" aria-label="Library sections">
              <a className="button" href="#handbooks">📖 Browse handbooks</a>
              <a className="button secondary" href="#governance">🧭 Open governance shelf</a>
              <a className="button secondary" href="#delivery">✅ Delivery references</a>
              <Link className="button secondary" href="/admin/knowledge/assets/">Tool assets</Link>
            </nav>
          )}
        </div>

        {!activeModule ? (
          <>
            <section className="library-section" id="handbooks" aria-labelledby="handbooks-heading">
              <div className="section-heading">
                <div>
                  <h2 id="handbooks-heading">📚 Handbooks</h2>
                  <p>Download the HTML editions or Markdown source files.</p>
                </div>
                <Link href="/admin/knowledge/handbooks/">All handbooks →</Link>
              </div>
              <div className="handbook-controls">
                <label className="handbook-search">
                  <span>Search handbooks</span>
                  <input type="search" placeholder="Search by topic or technology…" value={handbookSearch} onChange={(event) => setHandbookSearch(event.target.value)} />
                </label>
                <div className="handbook-filters" role="group" aria-label="Handbook category filters">
                  {handbookCategories.map((category) => (
                    <button
                      aria-pressed={activeHandbookCategory === category.id}
                      aria-controls="handbook-grid"
                      className={activeHandbookCategory === category.id ? "handbook-filter is-active" : "handbook-filter"}
                      key={category.id}
                      onClick={() => setActiveHandbookCategory(category.id)}
                      type="button"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="handbook-grid" id="handbook-grid">
                {visibleHandbooks.map((handbook) => {
                  const htmlReference = findHandbookReference(handbook.html);
                  const markdownReference = findHandbookReference(handbook.markdown);
                  return (
                    <article className="handbook-card" key={handbook.title}>
                      <div className="handbook-kicker">{handbook.categoryLabel}</div>
                      <h3>{handbook.title}</h3>
                      <p>{handbook.description}</p>
                      <ul className="dependency-chip-list handbook-tags" aria-label={`${handbook.title} technologies`}>
                        {handbook.tags.map((tag) => (
                          <li key={tag}>
                            <span className="dependency-chip">
                              <HandbookTechnologyIcon tag={tag} />
                              <span className="dependency-chip-label">{tag}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="handbook-actions">
                        {isLoading ? <span>Loading HTML edition…</span> : htmlReference ? <><Link href={readerHref(htmlReference.id)}>Read HTML edition</Link><Link href={`/api/knowledge/${encodeURIComponent(htmlReference.id)}`}>Download HTML ↗</Link></> : <span>HTML edition not added</span>}
                        {isLoading ? <span>Loading Markdown source…</span> : markdownReference ? <><Link href={readerHref(markdownReference.id)}>Read Markdown</Link><Link href={`/api/knowledge/${encodeURIComponent(markdownReference.id)}`}>Download Markdown ↗</Link></> : <span>Markdown source not added</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
              {visibleHandbooks.length === 0 && <p className="handbook-empty" role="status">No handbook matches that search yet.</p>}
              {isLoading && <p className="handbook-status" aria-live="polite">Loading handbook references…</p>}
              {isError && <p className="note" role="alert">{message}</p>}
            </section>

            <div className="note reading-path"><strong>💡 Reading path:</strong> Start with Console architecture for UI boundaries, then Backend API for service boundaries, then Database Engineering for persistence decisions.</div>

            <section className="library-shelves" aria-label="Governance and delivery references">
              {shelfReferences.map((shelf) => (
                <div className="library-panel" id={shelf.id} key={shelf.id}>
                  <h2>{shelf.title}</h2>
                  <p>{shelf.description}</p>
                  <ul>
                    {shelf.items.map((item) => {
                      const resource = resources.find((entry) => entry.title === item.resourceTitle);
                      return <li key={item.resourceTitle}>{resource
                        ? <><Link href={readerHref(resource.id)}>{item.title}</Link> · <Link href={`/api/knowledge/${encodeURIComponent(resource.id)}`}>Download</Link></>
                        : <span>{item.title}{isLoading ? " (loading)" : " (not added yet)"}</span>}
                      </li>;
                    })}
                  </ul>
                  <Link className="shelf-module-link" href={`/admin/knowledge/${shelf.id}/`}>Open {shelf.id} module →</Link>
                </div>
              ))}
            </section>
          </>
        ) : (
          <section className="library-section" aria-labelledby="module-folders-heading">
            <h2 id="module-folders-heading">{activeModule.title} folders</h2>
            <div className="library-grid">
              {moduleFolders.map((folder) => {
                const count = resources.filter((resource) => resource.folder === folder.path).length;
                return <Link className="library-card" href={`?folder=${encodeURIComponent(folder.path)}#saved-references`} key={folder.path}>
                  <h3>{folder.label}</h3>
                  <p>{folder.description}</p>
                  <span>{count} {count === 1 ? "reference" : "references"}</span>
                </Link>;
              })}
            </div>
          </section>
        )}

        {initialModule ? <section className="library-section" id="saved-references" aria-labelledby="references-heading">
          <div className="directory-toolbar">
            <div>
              <nav className="library-location" aria-label="Library location">
                {selectedFolder && <Link href={`/admin/knowledge/${initialModule}/`}>All {activeModule?.title.toLocaleLowerCase()}</Link>}
                <span className="eyebrow">{selectedFolder?.label ?? `All ${activeModule?.title.toLocaleLowerCase()}`}</span>
              </nav>
              <h2 id="references-heading">Saved references</h2>
              <p aria-live="polite">{isLoading ? "Loading references…" : folderResources.length ? `Showing ${visibleResources.length} of ${folderResources.length} references${selectedFolder ? ` in ${selectedFolder.label}` : ""}.` : ""}</p>
            </div>
            <div className="directory-search">
              <label htmlFor="knowledge-search">Filter references</label>
              <input id="knowledge-search" type="search" autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </div>
          {!isLoading && folderResources.length === 0 && (
            <p className="note">{selectedFolder ? `No references in ${selectedFolder.label} yet.` : `No references in ${activeModule?.title.toLocaleLowerCase()} yet.`}</p>
          )}
          {isError && <p className="note" role="alert">{message}</p>}
          <div className="knowledge-table-scroll" tabIndex={0} role="region" aria-label="Saved reference documents table">
            <table className="knowledge-resource-table">
              <caption className="sr-only">Saved knowledge references</caption>
              <thead><tr><th scope="col">File name</th><th scope="col">Type</th><th scope="col">Area</th><th scope="col">Download</th></tr></thead>
              <tbody>{visibleResources.map((resource) => {
              const folder = folders.find((entry) => entry.path === resource.folder);
              return <tr key={resource.id}>
                <th scope="row"><span>{resource.filename}</span><small>{resource.title}</small></th>
                <td>{resource.contentType.replace("text/", "").replace("application/", "")}</td>
                <td>{folder?.label || resource.folder}</td>
                <td className="knowledge-table-actions">
                  {(resource.contentType === "text/html" || resource.contentType === "text/markdown") && <Link href={readerHref(resource.id)}>View</Link>}
                  <Link href={`/api/knowledge/${encodeURIComponent(resource.id)}`}>Download</Link>
                </td>
              </tr>;
            })}</tbody>
            </table>
          </div>
        </section> : null}

        {initialModule ? <section id="manage-references" className="library-management" aria-label="Manage library references">
          <details>
            <summary>Add a reference to this library</summary>
            <p>Accepted files: PDF, DOCX, Markdown, HTML, UTF-8 text, PNG, JPEG, WebP, or TIFF. Maximum size: 20 MB. HTML previews run in an isolated frame, and Markdown references are formatted for reading.</p>
            <form className="knowledge-form" onSubmit={addReference}>
              <label htmlFor="knowledge-title">Title</label>
              <input id="knowledge-title" name="title" type="text" maxLength={160} required autoComplete="off" />
              <label htmlFor="knowledge-folder">Library folder</label>
              <select id="knowledge-folder" name="folder" required defaultValue={selectedFolder?.path ?? (moduleFolders.length === 1 ? moduleFolders[0].path : "")}>
                <option value="" disabled>Select a folder</option>
                {moduleFolders.map((folder) => <option value={folder.path} key={folder.path}>{folder.label}</option>)}
              </select>
              <label htmlFor="knowledge-file">Reference file</label>
              <input id="knowledge-file" name="file" type="file" accept=".pdf,.docx,.md,.markdown,.txt,.html,.htm,.png,.jpg,.jpeg,.webp,.tif,.tiff,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain,text/html,image/png,image/jpeg,image/webp,image/tiff" required />
              <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding…" : "Add to directory"}</button>
            </form>
            <p className="knowledge-message" role={isError ? "alert" : "status"} aria-live="polite">{message}</p>
          </details>
        </section> : null}
      </main>
      <SiteFooter />
    </>
  );
}
