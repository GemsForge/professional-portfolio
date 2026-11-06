import type { Metadata } from "next";
import { KnowledgeDirectory } from "@/components/knowledge-directory";
import "../admin/knowledge/knowledge-directory.css";

export const metadata: Metadata = { title: "Developer Knowledge Wiki · GemsForge", description: "Handbooks, standards, and practical engineering references by GemsForge." };

/** Renders the public read-only view of owner-uploaded knowledge documents. */
export default function KnowledgeWikiPage() { return <KnowledgeDirectory publicMode />; }
