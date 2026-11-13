import type { Metadata } from "next";
import { KnowledgeDirectory } from "@/components/knowledge-directory";
import "@/app/knowledge/knowledge.css";

export const metadata: Metadata = {
  title: "Developer Wiki · GemsForge",
  description: "Diamond's personal development notes, working examples, and hard-to-find fixes.",
};

/** Renders the public, read-only Developer Wiki directory. */
export default function DeveloperWikiPage() {
  return <KnowledgeDirectory publicMode />;
}
