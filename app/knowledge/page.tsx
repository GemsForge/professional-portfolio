import type { Metadata } from "next";
import { KnowledgeDirectory } from "@/components/knowledge-directory";
import "../admin/knowledge/knowledge-directory.css";

export const metadata: Metadata = {
  title: "Developer Wiki · GemsForge",
  description: "Diamond's personal development notes, working examples, and hard-to-find fixes.",
};

/** Renders the existing directory as a public, read-only index of private wikis. */
export default function DeveloperWikiPage() {
  return <KnowledgeDirectory publicMode />;
}
