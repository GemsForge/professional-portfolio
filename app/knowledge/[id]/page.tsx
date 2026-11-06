import type { Metadata } from "next";
import { PublicKnowledgeReader } from "@/components/public-knowledge-reader";
import "../../admin/knowledge/knowledge-directory.css";

export const metadata: Metadata = { title: "Developer Reference · GemsForge" };

/** Renders one public reference in the shared safe Markdown and HTML reader. */
export default async function KnowledgeDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicKnowledgeReader id={id} />;
}
