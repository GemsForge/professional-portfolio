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
  const [page, setPage] = useState(0);
  const [readerHeadingCollapsed, setReaderHeadingCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContentsTitle, setActiveContentsTitle] = useState("");

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

  /** Keeps the reader heading compact after it leaves the initial viewport. */
  useEffect(() => {
    const handleScroll = () => {
      setReaderHeadingCollapsed(window.scrollY > 140);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const htmlPreviewUrl = resource?.contentType === "text/html"
    ? `/api/knowledge/${encodeURIComponent(resource.id)}?render=html`
    : undefined;
  /** Groups a generated Markdown handbook into one chapter and its Page sections. */
  const chapterHeading = markdown.match(/^#\s+(?!Page\b)(.+)$/im)?.[1]?.replace(/\s+#*$/, "").trim();
  const pageBreak = /(?=^#{1,6}\s+Page\b)/im;
  const rawPageSources = markdown.split(pageBreak).filter((part) => part.trim());
  const pageSources = rawPageSources.length > 1 && /^#\s+(?!Page\b).+\s*$/s.test(rawPageSources[0].trim())
    ? [`${rawPageSources[0].trim()}\n\n${rawPageSources[1].trim()}`, ...rawPageSources.slice(2)]
    : rawPageSources;
  const chapters = [{
    title: chapterHeading ?? "Chapter 1",
    pages: pageSources.length ? pageSources : [markdown],
  }];
  const currentChapter = chapters[0];
  const pages = currentChapter.pages;
  const pageSource = pages[page] ?? pages[0] ?? markdown;
  const pageTabs = pages.map((source, index) => ({
    index,
    title: (source.match(/^#{1,6}\s+Page\b\s*:?[\s-]*(.+)$/im)?.[1] ?? source.match(/^#{2,6}\s+(.+)$/m)?.[1] ?? "Untitled page").replace(/^\d+\s*:\s*/, "").replace(/\s+#*$/, "").trim(),
  }));
  const tableOfContents = [...pageSource.matchAll(/^(#{2,6})\s+(.+)$/gm)].map((match) => ({
    level: match[1].length,
    title: match[2].replace(/\s+#*$/, "").trim(),
  }));
  useEffect(() => {
    const headings = [...document.querySelectorAll<HTMLElement>(".knowledge-reader-content h2, .knowledge-reader-content h3, .knowledge-reader-content h4, .knowledge-reader-content h5, .knowledge-reader-content h6")];
    if (!headings.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
      const title = visible[0]?.target.textContent?.trim();
      if (title) setActiveContentsTitle(title);
    }, { rootMargin: "-230px 0px -55% 0px", threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [page, pageSource, tableOfContents]);
  /** Finds matching handbook pages and a short context excerpt across the full document. */
  const searchResults = searchQuery.trim()
    ? pages.flatMap((source, index) => {
      const query = searchQuery.trim().toLowerCase();
      const plainText = source.replace(/[#*_`>\[\]()-]/g, " ").replace(/\s+/g, " ").trim();
      const matchIndex = plainText.toLowerCase().indexOf(query);
      return matchIndex < 0 ? [] : [{
        index,
        title: pageTabs[index]?.title ?? `Page ${index + 1}`,
        excerpt: `${matchIndex > 36 ? "…" : ""}${plainText.slice(Math.max(0, matchIndex - 36), matchIndex + query.length + 72)}…`,
      }];
    })
    : [];
  /** Scrolls a current-page contents entry to its rendered heading. */
  const navigateToContents = (title: string) => {
    const heading = [...document.querySelectorAll<HTMLElement>(".knowledge-reader-content h2, .knowledge-reader-content h3, .knowledge-reader-content h4, .knowledge-reader-content h5, .knowledge-reader-content h6")]
      .find((entry) => entry.textContent?.trim() === title);
    heading?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  /** Selects a page tab and returns the reader to the beginning of that page. */
  const navigateToPage = (nextPage: number) => {
    setPage(nextPage);
  };
  useEffect(() => {
    if (!resource || view !== "rendered") return;
    const timer = window.setTimeout(() => {
      const article = document.querySelector<HTMLElement>(".knowledge-reader-content");
      if (!article) return;
      window.scrollTo({ top: Math.max(0, article.offsetTop - 230), behavior: "smooth" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page, resource, view]);

  return <>
    <SiteHeader pathname="/admin/knowledge/" />
    <main id="main" className="wrap knowledge-page knowledge-reader">
      <nav className="library-location" aria-label="Breadcrumb">
        <Link href="/admin/knowledge/">Developer library</Link>
        <span aria-current="page">{resource?.title ?? "Reference"}</span>
      </nav>
      <header className={`reader-heading${readerHeadingCollapsed ? " is-collapsed" : ""}`}>
        <div className="reader-heading-copy">
          <p className="eyebrow">Private library · {resource?.contentType === "text/html" ? "HTML document" : "Markdown document"}</p>
          <h1>{resource?.title ?? (loading ? "Opening reference…" : "Reference unavailable")}</h1>
          {resource && <p>{resource.filename}</p>}
        </div>
        {resource && <details className="reader-view-menu" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
          <summary className="button secondary">View options</summary>
          <div className="reader-view-options" role="group" aria-label="Reference view options">
            {resource.contentType === "text/markdown" && <>
              <button type="button" onClick={() => setView("rendered")} aria-pressed={view === "rendered"}>Render Markdown</button>
              <button type="button" onClick={() => setView("source")} aria-pressed={view === "source"}>Markdown source</button>
              <Link href={`/api/knowledge/${encodeURIComponent(resource.id)}?format=html`}>Download HTML ↗</Link>
              <Link href={`/api/knowledge/${encodeURIComponent(resource.id)}`}>Download Markdown ↗</Link>
            </>}
            {resource.contentType === "text/html" && <Link href={`/api/knowledge/${encodeURIComponent(resource.id)}`}>Download HTML ↗</Link>}
          </div>
        </details>}
      </header>
      {loading && <p role="status" aria-live="polite">Loading reference…</p>}
      {error && <p className="note" role="alert">{error}</p>}
      {!loading && resource?.contentType === "text/html" && htmlPreviewUrl && (
        <iframe className="knowledge-html-preview" src={htmlPreviewUrl} title={`HTML preview: ${resource.title}`} sandbox="" referrerPolicy="no-referrer" />
      )}
      {!loading && resource?.contentType === "text/markdown" && (view === "rendered"
        ? <div className="knowledge-reader-layout">
          <aside className="knowledge-reader-sidebar" aria-label="Handbook navigation">
            <section className="knowledge-toc" aria-labelledby="toc-heading">
              <label className="knowledge-search-label" htmlFor="knowledge-search">Search this handbook</label>
              <input id="knowledge-search" className="knowledge-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search keywords…" />
              {searchQuery.trim() && <div className="knowledge-search-results" aria-live="polite">
                <p>{searchResults.length} matching page{searchResults.length === 1 ? "" : "s"}</p>
                {searchResults.map((result) => <button type="button" key={result.index} onClick={() => setPage(result.index)}><strong>{result.title}</strong><span>{result.excerpt}</span></button>)}
                {!searchResults.length && <span>No matching pages.</span>}
              </div>}
              <h2 id="toc-heading">Contents</h2>
              <ol>
                {tableOfContents.map((entry, index) => <li key={`${page}-${index}`} className={activeContentsTitle === entry.title ? "is-active" : ""} style={{ paddingLeft: `${Math.max(0, entry.level - 2) * 12}px` }}><button type="button" onClick={() => { setActiveContentsTitle(entry.title); navigateToContents(entry.title); }}>{entry.title}</button></li>)}
              </ol>
            </section>
          </aside>
          <section className="knowledge-reader-main">
            <nav className="knowledge-page-tabs-header" aria-label={`${currentChapter.title} pages`}>
              <div role="tablist" aria-label="Handbook pages">
                {pageTabs.map((tab) => <button className={tab.index === page ? "is-active" : ""} key={tab.index} onClick={() => navigateToPage(tab.index)} role="tab" aria-selected={tab.index === page} type="button">{tab.index + 1}. {tab.title}</button>)}
              </div>
            </nav>
            <article className="knowledge-reader-content"><KnowledgeMarkdown source={pageSource} /></article>
            <nav className="knowledge-pagination" aria-label={`${currentChapter.title} pages`}><button className="button secondary" type="button" onClick={() => navigateToPage(Math.max(0, page - 1))} disabled={page === 0}>Previous</button><span>{currentChapter.title} · Page {page + 1} of {Math.max(1, pages.length)}</span><button className="button secondary" type="button" onClick={() => navigateToPage(Math.min(pages.length - 1, page + 1))} disabled={page >= pages.length - 1}>Next</button></nav>
          </section>
        </div>
        : <pre className="knowledge-source" tabIndex={0} aria-label="Markdown source"><code>{markdown}</code></pre>)}
    </main>
    <SiteFooter />
  </>;
}
