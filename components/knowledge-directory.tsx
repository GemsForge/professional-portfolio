"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type LibraryFolder = {
  path: string;
  label: string;
  group: "handbooks" | "governance" | "delivery" | "assets";
  description: string;
};

type KnowledgeResource = {
  id: string;
  title: string;
  folder: string;
  filename: string;
  size: number;
  createdAt: string;
};

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
  { id: "governance", title: "Governance shelf", description: "Shared standards and reusable ways of working." },
  { id: "delivery", title: "Delivery references", description: "Definition of Done, development checkpoints, and sprint delivery resources." },
  { id: "assets", title: "Tool and brand assets", description: "Reference logos and supporting images for developer materials." },
] as const;

function formatSize(size: number) {
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/** Owns the private library index, folder filtering, search, and upload interaction. */
export function KnowledgeDirectory({ initialFolder }: { initialFolder?: string }) {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [activeFolder] = useState<string | null>(
    folders.some((folder) => folder.path === initialFolder) ? initialFolder! : null,
  );
  const [search, setSearch] = useState("");
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
  const folderResources = selectedFolder
    ? resources.filter((resource) => resource.folder === selectedFolder.path)
    : resources;
  const visibleResources = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return folderResources.filter((resource) =>
      [resource.title, resource.folder, resource.filename].some((value) => value.toLocaleLowerCase().includes(query)),
    );
  }, [folderResources, search]);

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
          <h1>GemsForge Developer Library</h1>
          <p className="lead">Build with intention. Keep the map. A private home for the handbooks, standards, and delivery references that support your work.</p>
          <nav className="library-links" aria-label="Library sections">
            <a className="button secondary" href="#handbooks">Browse handbooks</a>
            <a className="button secondary" href="#governance">Open governance shelf</a>
            <a className="button secondary" href="#delivery">Delivery references</a>
            <a className="button" href="#saved-references">Find a reference ↓</a>
          </nav>
        </div>

        {sections.map((section) => (
          <section className="library-section" id={section.id} aria-labelledby={`${section.id}-heading`} key={section.id}>
            <h2 id={`${section.id}-heading`}>{section.title}</h2>
            <p>{section.description}</p>
            <div className="library-grid">
              {folders.filter((folder) => folder.group === section.id).map((folder) => {
                const count = resources.filter((resource) => resource.folder === folder.path).length;
                return (
                  <Link className="library-card" href={`?folder=${encodeURIComponent(folder.path)}#saved-references`} key={folder.path}>
                    <h3>{folder.label}</h3>
                    <p>{folder.description}</p>
                    <span>{count} {count === 1 ? "reference" : "references"}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section className="library-section" id="saved-references" aria-labelledby="references-heading">
          <div className="directory-toolbar">
            <div>
              <nav className="library-location" aria-label="Library location">
                {selectedFolder && <Link href="/admin/knowledge/">All folders</Link>}
                <span className="eyebrow">{selectedFolder?.label ?? "All folders"}</span>
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
            <p className="note">{selectedFolder ? `No references in ${selectedFolder.label} yet.` : "No references saved yet. Use “Add a reference to this library” to start your library."}</p>
          )}
          {isError && <p className="note" role="alert">{message}</p>}
          <ul className="knowledge-items" aria-label="Saved reference documents">
            {visibleResources.map((resource) => {
              const folder = folders.find((entry) => entry.path === resource.folder);
              const details = [folder?.label || resource.folder, resource.filename, formatSize(resource.size), new Date(resource.createdAt).toLocaleDateString()].join(" · ");
              return (
                <li className="knowledge-item" key={resource.id}>
                  <h3>{resource.title}</h3>
                  <p>{details}</p>
                  <Link href={`/api/knowledge/${encodeURIComponent(resource.id)}`}>Download {resource.title}</Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="library-management" aria-label="Manage library references">
          <details>
            <summary>Add a reference to this library</summary>
            <p>Accepted files: PDF, DOCX, Markdown, HTML, UTF-8 text, PNG, JPEG, WebP, or TIFF. Maximum size: 20 MB. HTML files are downloaded as attachments and are not rendered on this site.</p>
            <form className="knowledge-form" onSubmit={addReference}>
              <label htmlFor="knowledge-title">Title</label>
              <input id="knowledge-title" name="title" type="text" maxLength={160} required autoComplete="off" />
              <label htmlFor="knowledge-folder">Library folder</label>
              <select id="knowledge-folder" name="folder" required defaultValue={selectedFolder?.path ?? ""}>
                <option value="" disabled>Select a folder</option>
                {folders.map((folder) => <option value={folder.path} key={folder.path}>{folder.label}</option>)}
              </select>
              <label htmlFor="knowledge-file">Reference file</label>
              <input id="knowledge-file" name="file" type="file" accept=".pdf,.docx,.md,.markdown,.txt,.html,.htm,.png,.jpg,.jpeg,.webp,.tif,.tiff,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain,text/html,image/png,image/jpeg,image/webp,image/tiff" required />
              <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding…" : "Add to directory"}</button>
            </form>
            <p className="knowledge-message" role={isError ? "alert" : "status"} aria-live="polite">{message}</p>
          </details>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
