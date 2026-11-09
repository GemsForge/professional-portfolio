import type { Metadata } from "next";
import { KnowledgeReader } from "@/components/knowledge-reader";
import "../../admin/knowledge/knowledge-directory.css";

export const metadata: Metadata = {
  title: "Developer Wiki · GemsForge",
  robots: { index: false, follow: false },
};

/** Renders a public Wiki document through the shared reader; management remains owner-gated. */
export default async function DeveloperWikiDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KnowledgeReader id={id} publicMode />;
}
