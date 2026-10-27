"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KnowledgeMarkdown } from "@/components/knowledge-markdown";
import type { KnowledgeResource } from "@/lib/knowledge-types";

/** Presents one private HTML or Markdown reference in a focused reading view. */
export function KnowledgeReader({ id }: { /** Stable library resource identifier. */ id: string }) {
  const [resource, setResource] = useState<KnowledgeResource | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"rendered" | "source">("rendered");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const indexResponse = await fetch("/api/knowledge", { cache: "no-store", headers: { Accept: "application/json" } });
        if (!indexResponse.ok) throw new Error("Could not open your library. Refresh the page and try again.");
        const index = await indexResponse.json() as { resources?: KnowledgeResource[] };
        const selected = index.resources?.find((entry) => entry.id === id);
        if (!selected) throw new Error("This reference is no longer available in your library.");
        if (!["text/html", "text/markdown"].includes(selected.contentType)) {
          throw new Error("This reader supports HTML and Markdown references.");
        }
        let content = "";
        if (selected.contentType === "text/markdown") {
          const contentResponse = await fetch(`/api/knowledge/${encodeURIComponent(selected.id)}`, { cache: "no-store" });
          if (!contentResponse.ok) throw new Error("Could not load this reference. Refresh the page and try again.");
          content = await contentResponse.text();
        }
        if (active) {
          setResource(selected);
          setMarkdown(content);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load this reference.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);

  const htmlPreviewUrl = resource?.contentType === "text/html"
    ? `/api/knowledge/${encodeURIComponent(resource.id)}?render=html`
    : undefined;

  return <>
    <SiteHeader pathname="/admin/knowledge/" />
    <main id="main" className="wrap knowledge-page knowledge-reader">
      <nav className="library-location" aria-label="Breadcrumb">
        <Link href="/admin/knowledge/">Developer library</Link>
        <span aria-current="page">{resource?.title ?? "Reference"}</span>
      </nav>
      <header className="reader-heading">
        <p className="eyebrow">Private library · {resource?.contentType === "text/html" ? "HTML document" : "Markdown document"}</p>
        <h1>{resource?.title ?? (loading ? "Opening reference…" : "Reference unavailable")}</h1>
        {resource && <p>{resource.filename}</p>}
        {resource && <details className="reader-view-menu">
          <summary className="button secondary">View options</summary>
          <div className="reader-view-options" role="group" aria-label="Reference view options">
            {resource.contentType === "text/markdown" && <>
              <button type="button" onClick={() => setView("rendered")} aria-pressed={view === "rendered"}>Render Markdown</button>
              <button type="button" onClick={() => setView("source")} aria-pressed={view === "source"}>Markdown source</button>
            </>}
            <Link href={`/api/knowledge/${encodeURIComponent(resource.id)}`}>Download Markdown ↗</Link>
          </div>
        </details>}
      </header>
      {loading && <p role="status" aria-live="polite">Loading reference…</p>}
      {error && <p className="note" role="alert">{error}</p>}
      {!loading && resource?.contentType === "text/html" && htmlPreviewUrl && (
        <iframe className="knowledge-html-preview" src={htmlPreviewUrl} title={`HTML preview: ${resource.title}`} sandbox="" referrerPolicy="no-referrer" />
      )}
      {!loading && resource?.contentType === "text/markdown" && (view === "rendered"
        ? <article className="knowledge-reader-content"><KnowledgeMarkdown source={markdown} /></article>
        : <pre className="knowledge-source" tabIndex={0} aria-label="Markdown source"><code>{markdown}</code></pre>)}
    </main>
    <SiteFooter />
  </>;
}
