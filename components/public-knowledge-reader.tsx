"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KnowledgeMarkdown } from "@/components/knowledge-markdown";
import type { KnowledgeResource } from "@/lib/knowledge-types";

/** Reads public Markdown safely or previews uploaded HTML in a sandboxed frame. */
export function PublicKnowledgeReader({ id }: { /** Resource identifier in the public catalogue. */ id: string }) {
 const [resource,setResource]=useState<KnowledgeResource>(); const [source,setSource]=useState(""); const [error,setError]=useState("");
 useEffect(()=>{let active=true; fetch("/api/public/knowledge").then(r=>r.json() as Promise<{resources:KnowledgeResource[]}>).then(async data=>{const found=data.resources.find(item=>item.id===id);if(!found)throw new Error("Reference not found."); if(found.contentType==="text/markdown"||found.contentType==="text/plain"){const response=await fetch(`/api/public/knowledge/${encodeURIComponent(id)}`);if(!response.ok)throw new Error("Could not load reference.");const text=await response.text();if(active)setSource(text);}if(active)setResource(found);}).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:"Could not load reference.");});return()=>{active=false;};},[id]);
 return <><SiteHeader pathname="/knowledge/"/><main id="main" className="wrap knowledge-page public-reader"><Link className="wiki-back" href="/knowledge/"><ArrowLeft aria-hidden="true"/> Developer Library</Link>{error?<p role="alert">{error}</p>:!resource?<p>Loading reference…</p>:<><header className="wiki-reader-heading"><p className="eyebrow">{resource.folder.replaceAll("/"," · ")}</p><h1>{resource.title}</h1><p>{resource.description ?? resource.filename}</p><a className="button secondary" href={`/api/public/knowledge/${encodeURIComponent(id)}`}><Download aria-hidden="true"/> Download original</a></header>{resource.contentType==="text/markdown"||resource.contentType==="text/plain"?<article className="knowledge-reader-content knowledge-markdown"><KnowledgeMarkdown source={source}/></article>:resource.contentType==="text/html"?<iframe className="knowledge-html-preview" title={resource.title} sandbox="" src={`/api/public/knowledge/${encodeURIComponent(id)}?render=html`}/>:<p>This file can be downloaded using the button above.</p>}</>}</main><SiteFooter/></>;
}
