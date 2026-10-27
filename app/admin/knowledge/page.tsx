import type { Metadata } from "next";
import { KnowledgeDirectory } from "@/components/knowledge-directory";
import "./knowledge-directory.css";

export const metadata: Metadata = {
  title: "GemsForge Developer Library",
  robots: { index: false, follow: false },
};

/** Renders the owner-only knowledge library after the worker's identity gate. */
export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ folder?: string }> }) {
  const { folder } = await searchParams;
  return <KnowledgeDirectory key={folder ?? "all-folders"} initialFolder={folder} />;
}
