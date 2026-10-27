import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeDirectory, type KnowledgeModule } from "@/components/knowledge-directory";
import "../knowledge-directory.css";

export const metadata: Metadata = {
  title: "Developer Library Module",
  robots: { index: false, follow: false },
};

/** Renders one owner-only library module after the worker verifies the owner identity. */
export default async function KnowledgeModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ folder?: string }>;
}) {
  const [{ module }, { folder }] = await Promise.all([params, searchParams]);
  if (!(["handbooks", "governance", "delivery", "assets"] as string[]).includes(module)) notFound();

  return <KnowledgeDirectory
    key={`${module}:${folder ?? "all-folders"}`}
    initialModule={module as KnowledgeModule}
    initialFolder={folder}
  />;
}
