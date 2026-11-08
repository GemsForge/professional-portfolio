import type { Metadata } from "next";
import { KnowledgeDirectory } from "@/components/knowledge-directory";
import "../knowledge/knowledge-directory.css";

export const metadata: Metadata = {
  title: "Handbooks · Developer Wiki",
  robots: { index: false, follow: false },
};

/** Keeps the established owner handbook tools available at the requested admin route. */
export default function AdminHandbooksPage() {
  return <KnowledgeDirectory initialModule="handbooks" />;
}
