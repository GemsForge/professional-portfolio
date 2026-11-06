"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { KnowledgeResource } from "@/lib/knowledge-types";

type PublicSection = "governance" | "delivery" | "other";

const categories = [
  { id: "all", label: "All" },
  { id: "architecture", label: "Architecture" },
  { id: "backend", label: "Backend" },
  { id: "data", label: "Data" },
  { id: "project-management", label: "Project management" },
  { id: "codex", label: "Codex" },
  { id: "quality", label: "Quality" },
] as const;

const sectionLabels: Record<PublicSection, string> = {
  governance: "Governance and standards",
  delivery: "Delivery references",
  other: "More references",
};

/**
 * Presents published library resources using the directory's handbook and shelf patterns.
 * This public view only reads published resources and links to their public reader routes.
 */
export function PublicKnowledgeWiki() {
  const [items, setItems] = useState<KnowledgeResource[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]["id"]>("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/knowledge").then(async (response) => {
        if (!response.ok) throw new Error("The uploaded library is temporarily unavailable.");
        return response.json() as Promise<{ resources?: KnowledgeResource[] }>;
      }),
      fetch("/knowledge-library/index.json").then(async (response) => {
        if (!response.ok) throw new Error("The handbook library is temporarily unavailable.");
        return response.json() as Promise<{ resources?: KnowledgeResource[] }>;
      }),
    ])
      .then(([uploaded, maintained]) => {
        setItems([...(maintained.resources ?? []), ...(uploaded.resources ?? [])]);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "The library is temporarily unavailable."))
      .finally(() => setIsLoading(false));
  }, []);

  const handbooks = useMemo(() => items.filter((item) => item.folder.startsWith("handbooks/")), [items]);
  const visibleHandbooks = useMemo(() => handbooks.filter((item) => {
    const category = item.folder.split("/")[1] ?? "";
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const searchable = `${item.title} ${item.description ?? ""} ${item.folder} ${item.filename} ${item.tags?.join(" ") ?? ""}`;
    return matchesCategory && searchable.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }), [activeCategory, handbooks, query]);

  const shelves = useMemo(() => {
    const groups: Record<PublicSection, KnowledgeResource[]> = { governance: [], delivery: [], other: [] };
    for (const item of items) {
      if (item.folder.startsWith("handbooks/")) continue;
      if (item.folder.startsWith("governance/")) groups.governance.push(item);
      else if (item.folder.startsWith("delivery/")) groups.delivery.push(item);
      else groups.other.push(item);
    }
    return groups;
  }, [items]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleShelves = Object.entries(shelves) as [PublicSection, KnowledgeResource[]][];

  return (
    <>
      <SiteHeader pathname="/knowledge/" />
      <main id="main" className="wrap knowledge-page public-wiki">
        <header className="pagehero library-intro">
          <div className="eyebrow">GemsForge · Public knowledge library</div>
          <h1>GemsForge Developer Library</h1>
          <p className="lead">Build with intention. Keep the map. Explore practical handbooks, shared standards, and delivery references for thoughtful software work.</p>
          <nav className="library-links" aria-label="Library sections">
            <a className="button" href="#handbooks">Browse handbooks</a>
            {visibleShelves.filter(([, resources]) => resources.length > 0).map(([section]) => (
              <a className="button secondary" href={`#${section}`} key={section}>{sectionLabels[section]}</a>
            ))}
          </nav>
        </header>

        <section className="library-section" id="handbooks" aria-labelledby="public-handbooks-heading">
          <div className="section-heading">
            <div>
              <h2 id="public-handbooks-heading">Handbooks</h2>
              <p>Long-form guides grouped by the work they support.</p>
            </div>
            <span>{visibleHandbooks.length} of {handbooks.length} guides</span>
          </div>
          <div className="handbook-controls">
            <label className="handbook-search">
              <span>Search the library</span>
              <span className="public-library-search">
                <Search aria-hidden="true" />
                <input type="search" placeholder="Search by topic or technology…" value={query} onChange={(event) => setQuery(event.target.value)} />
              </span>
            </label>
            <div className="handbook-filters" role="group" aria-label="Handbook category filters">
              {categories.map((category) => (
                <button
                  aria-pressed={activeCategory === category.id}
                  aria-controls="public-handbook-grid"
                  className={activeCategory === category.id ? "handbook-filter is-active" : "handbook-filter"}
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  type="button"
                >{category.label}</button>
              ))}
            </div>
          </div>
          {error ? <p className="note" role="alert">{error}</p> : null}
          {isLoading ? <p className="handbook-status" aria-live="polite">Loading published guides…</p> : null}
          <div className="handbook-grid" id="public-handbook-grid">
            {visibleHandbooks.map((item) => {
              const category = categories.find((entry) => entry.id === item.folder.split("/")[1]);
              const tags = item.tags?.length ? item.tags : [];
              const description = item.description || `${item.filename} · ${Math.ceil(item.size / 1024)} KB`;
              return (
                <a className="handbook-card handbook-card-link" href={`/knowledge/${encodeURIComponent(item.id)}/`} key={item.id}>
                  <div className="handbook-kicker">{category?.label ?? "Handbook"}</div>
                  <h3>{item.title}</h3>
                  <p>{description}</p>
                  {tags.length > 0 ? (
                    <ul className="dependency-chip-list handbook-tags" aria-label={`${item.title} topics`}>
                      {tags.map((tag) => <li key={tag}><span className="dependency-chip"><span className="dependency-chip-label">{tag}</span></span></li>)}
                    </ul>
                  ) : null}
                  <span className="public-card-action">Read handbook <ArrowUpRight aria-hidden="true" /></span>
                </a>
              );
            })}
          </div>
          {!isLoading && !error && visibleHandbooks.length === 0 ? <p className="handbook-empty" role="status">No handbook matches that search and category.</p> : null}
        </section>

        <div className="library-shelves" aria-label="Other public library references">
          {visibleShelves.map(([section, resources]) => {
            const matches = resources.filter((item) => {
              const searchable = `${item.title} ${item.description ?? ""} ${item.folder} ${item.filename} ${item.tags?.join(" ") ?? ""}`;
              return searchable.toLocaleLowerCase().includes(normalizedQuery);
            });
            if (resources.length === 0) return null;
            return (
              <section className="library-panel" id={section} key={section} aria-labelledby={`${section}-heading`}>
                <h2 id={`${section}-heading`}>{sectionLabels[section]}</h2>
                <p>{section === "governance" ? "Shared standards, policies, and reusable ways of working." : section === "delivery" ? "Definition of Done, development checkpoints, and sprint delivery resources." : "Additional published references from the library."}</p>
                {matches.length > 0 ? <ul>{matches.map((item) => <li key={item.id}><a href={`/knowledge/${encodeURIComponent(item.id)}/`}>{item.title}</a></li>)}</ul> : <p className="handbook-empty" role="status">No references match this search.</p>}
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
