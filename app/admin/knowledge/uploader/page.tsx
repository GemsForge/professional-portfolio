import type { Metadata } from "next";
import { KnowledgeDirectory } from "@/components/knowledge-directory";
import "../knowledge-directory.css";

export const metadata: Metadata = {
  title: "Wiki Page Uploader · GemsForge",
  robots: { index: false, follow: false },
};

/** Provides the owner-gated uploader and document manager embedded in Manage Project Assets. */
export default async function KnowledgeUploaderPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  return <KnowledgeDirectory initialFolder={folder} uploaderOnly />;
}
