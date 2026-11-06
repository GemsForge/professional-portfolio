"use client";

import { useEffect, useState } from "react";
import { Search, BookOpen, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { KnowledgeResource } from "@/lib/knowledge-types";

/** Lists all public reference records without exposing owner management controls. */
export function PublicKnowledgeWiki() {
  const [items, setItems] = useState<KnowledgeResource[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/public/knowledge").then(async response => { if (!response.ok) throw new Error("The library is temporarily unavailable."); return response.json() as Promise<{resources?: KnowledgeResource[]}>; }).then(data => setItems(data.resources ?? [])).catch(cause => setError(cause instanceof Error ? cause.message : "The library is temporarily unavailable.")); }, []);
  const visible = items.filter(item => `${item.title} ${item.description ?? ""} ${item.folder} ${item.tags?.join(" ") ?? ""}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <><SiteHeader pathname="/knowledge/"/><main id="main" className="wrap knowledge-page public-wiki"><header className="wiki-hero"><p className="eyebrow">GemsForge · Knowledge</p><h1>Developer Library</h1><p className="lead">Practical guides, technical references, and working knowledge for building thoughtful software.</p><label className="wiki-search"><Search aria-hidden="true"/><span className="sr-only">Search library</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search guides and topics"/></label></header><section className="wiki-results" aria-label="Library documents"><div className="wiki-results-heading"><h2>Browse the library</h2><span>{visible.length} references</span></div>{error ? <p role="alert">{error}</p> : <div className="wiki-grid">{visible.map(item => <article className="wiki-card" key={item.id}><div className="wiki-card-icon"><BookOpen aria-hidden="true"/></div><p className="wiki-category">{item.folder.replaceAll("/", " · ")}</p><h3><a href={`/knowledge/${encodeURIComponent(item.id)}/`}>{item.title}</a></h3><p>{item.description ?? `${item.filename} · ${Math.ceil(item.size / 1024)} KB`}</p><div className="wiki-card-footer"><span>{item.contentType.replace("text/", "").toUpperCase()}</span><a href={`/knowledge/${encodeURIComponent(item.id)}/`} aria-label={`Read ${item.title}`}>Read <ArrowUpRight aria-hidden="true"/></a></div></article>)}</div>}</section></main><SiteFooter/></>;
}
