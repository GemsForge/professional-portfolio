"use client";

// Intentional: use browser navigation because client-side route transitions are failing.
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KnowledgeMarkdown } from "@/components/knowledge-markdown";
import type { KnowledgeResource } from "@/lib/knowledge-types";

/**
 * Height of the sticky site header plus the collapsed reader heading and page
 * tabs. Used for the contents observer and for page-change scrolling; update
 * it with `scroll-margin-top` in knowledge.css when that chrome changes height.
 */
const STICKY_READER_OFFSET_PX = 230;

/**
 * Presents one library reference in the established reading view. Public mode
 * uses read-only public endpoints; the owner view keeps management APIs gated.
 */
export function KnowledgeReader({ id, publicMode = false }: {
  /** Stable library resource identifier. */
  id: string;
  /** Uses public read-only endpoints and the public directory as the return route. */
  publicMode?: boolean;
}) {
  const [resource, setResource] = useState<KnowledgeResource | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"rendered" | "source">("rendered");
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContentsTitle, setActiveContentsTitle] = useState("");
  const pageTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    let active = true;
    const apiBase = publicMode ? "/api/public/knowledge" : "/api/knowledge";
    async function load() {
      try {
        const indexResponse = await fetch(apiBase, { cache: "no-store", headers: { Accept: "application/json" } });
        if (!indexResponse.ok) throw new Error("Could not open your library. Refresh the page and try again.");
        const index = await indexResponse.json() as { resources?: KnowledgeResource[] };
        const selected = index.resources?.find((entry) => entry.id === id);
        if (!selected) throw new Error("This reference is no longer available in your library.");
        let content = "";
        if (selected.contentType === "text/markdown") {
          const contentResponse = await fetch(`${apiBase}/${encodeURIComponent(selected.id)}`, { cache: "no-store" });
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
  }, [id, publicMode]);

  // Name the browser tab after the open reference; the route's static metadata cannot know it.
  useEffect(() => {
    if (resource) document.title = `${resource.title} · Developer Wiki`;
  }, [resource]);

  /** Keeps downloads and previews on the reader's matching public or owner API. */
  function documentHref(resourceId: string, query = "") {
    const base = publicMode ? "/api/public/knowledge" : "/api/knowledge";
    return `${base}/${encodeURIComponent(resourceId)}${query}`;
  }

  const htmlPreviewUrl = resource?.contentType === "text/html"
    ? documentHref(resource.id, "?render=html")
    : undefined;
  /** Groups a generated Markdown handbook into one chapter and its Page sections. */
  const chapterHeading = markdown.match(/^#\s+(?!Page\b)(.+)$/im)?.[1]?.replace(/\s+#*$/, "").trim();
  const pageBreak = /(?=^#{1,6}\s+Page\b)/im;
  const rawPageSources = markdown.split(pageBreak).filter((part) => part.trim());
  const pageSources = rawPageSources.length > 1 && /^#\s+(?!Page\b).+\s*$/s.test(rawPageSources[0].trim())
    ? [`${rawPageSources[0].trim()}\n\n${rawPageSources[1].trim()}`, ...rawPageSources.slice(2)]
    : rawPageSources;
  /** The handbook's single chapter title, shown in the page tabs and pagination. */
  const chapterTitle = chapterHeading ?? "Chapter 1";
  const pages = pageSources.length ? pageSources : [markdown];
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
    }, { rootMargin: `-${STICKY_READER_OFFSET_PX}px 0px -55% 0px`, threshold: 0 });
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
  /** Moves focus and selection through the handbook's tabs using the ARIA tab pattern. */
  const handlePageTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = pageTabs.length - 1;
    const nextIndex = event.key === "ArrowRight" ? Math.min(lastIndex, index + 1)
      : event.key === "ArrowLeft" ? Math.max(0, index - 1)
        : event.key === "Home" ? 0
          : event.key === "End" ? lastIndex
            : null;
    if (nextIndex === null) return;
    event.preventDefault();
    navigateToPage(nextIndex);
    pageTabRefs.current[nextIndex]?.focus();
  };
  useEffect(() => {
    if (!resource || view !== "rendered") return;
    const timer = window.setTimeout(() => {
      const article = document.querySelector<HTMLElement>(".knowledge-reader-content");
      if (!article) return;
      window.scrollTo({ top: Math.max(0, article.offsetTop - STICKY_READER_OFFSET_PX), behavior: "smooth" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page, resource, view]);

  return <>
    <SiteHeader pathname={publicMode ? "/knowledge/" : "/admin/knowledge/"} handbookReader />
    <main id="main" className="wrap knowledge-page knowledge-reader">
      {/* Keep the compact wiki heading from first render so the large title block never takes over the reader. */}
      <header className="reader-heading is-collapsed">
        <div className="reader-heading-copy">
          <p className="eyebrow">MY DEVELOPER NOTES · {resource?.contentType === "text/html" ? "HTML document" : resource?.contentType === "text/markdown" ? "Markdown document" : "Reference"}</p>
          <h1>{resource?.title ?? (loading ? "Opening reference…" : "Reference unavailable")}</h1>
          {resource && <p>{resource.filename}</p>}
        </div>
        <nav className="reader-collapsed-breadcrumb" aria-label="Collapsed breadcrumb">
          <a href={publicMode ? "/knowledge/" : "/admin/knowledge/"}>Developer Wiki</a>
          <span aria-hidden="true">/</span>
          <span>{resource?.title ?? "Reference"}</span>
        </nav>
        {resource && <details className="reader-view-menu" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
          <summary className="button secondary">View options</summary>
          <div className="reader-view-options" role="group" aria-label="Reference view options">
            {resource.contentType === "text/markdown" && <>
              <button type="button" onClick={() => setView("rendered")} aria-pressed={view === "rendered"}>Render Markdown</button>
              <button type="button" onClick={() => setView("source")} aria-pressed={view === "source"}>Markdown source</button>
              <a href={documentHref(resource.id, "?format=html")}>Download HTML ↗</a>
              <a href={documentHref(resource.id)}>Download Markdown ↗</a>
            </>}
            {resource.contentType === "text/html" && <a href={documentHref(resource.id)}>Download HTML ↗</a>}
            {!['text/html', 'text/markdown'].includes(resource.contentType) && <a href={documentHref(resource.id)}>Download original</a>}
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
                {tableOfContents.map((entry, index) => <li key={`${page}-${index}`} className={activeContentsTitle === entry.title ? "is-active" : ""} data-level={entry.level}><button type="button" onClick={() => { setActiveContentsTitle(entry.title); navigateToContents(entry.title); }}>{entry.title}</button></li>)}
              </ol>
            </section>
          </aside>
          <section className="knowledge-reader-main">
            <nav className="knowledge-page-tabs-header" aria-label={`${chapterTitle} pages`}>
              <div role="tablist" aria-label="Handbook pages">
                {pageTabs.map((tab) => <button
                  aria-controls="knowledge-page-panel"
                  aria-selected={tab.index === page}
                  className={tab.index === page ? "is-active" : ""}
                  id={`knowledge-page-tab-${tab.index}`}
                  key={tab.index}
                  onClick={() => navigateToPage(tab.index)}
                  onKeyDown={(event) => handlePageTabKeyDown(event, tab.index)}
                  ref={(element) => { pageTabRefs.current[tab.index] = element; }}
                  role="tab"
                  tabIndex={tab.index === page ? 0 : -1}
                  type="button"
                >{tab.index + 1}. {tab.title}</button>)}
              </div>
            </nav>
            <article aria-labelledby={`knowledge-page-tab-${page}`} className="knowledge-reader-content" id="knowledge-page-panel" role="tabpanel" tabIndex={0}><KnowledgeMarkdown source={pageSource} /></article>
            <nav className="knowledge-pagination" aria-label={`${chapterTitle} pages`}><button className="button secondary" type="button" onClick={() => navigateToPage(Math.max(0, page - 1))} disabled={page === 0}>Previous</button><span>{chapterTitle} · Page {page + 1} of {Math.max(1, pages.length)}</span><button className="button secondary" type="button" onClick={() => navigateToPage(Math.min(pages.length - 1, page + 1))} disabled={page >= pages.length - 1}>Next</button></nav>
          </section>
        </div>
        : <pre className="knowledge-source" tabIndex={0} aria-label="Markdown source"><code>{markdown}</code></pre>)}
      {!loading && resource && !["text/html", "text/markdown"].includes(resource.contentType) && (
        <p className="note">This reference is available as a download: <a href={documentHref(resource.id)}>Download original</a></p>
      )}
    </main>
    <SiteFooter wikiMode />
  </>;
}
