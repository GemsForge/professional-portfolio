import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeDirectory, type KnowledgeModule } from "@/components/knowledge-directory";
import { KnowledgeReader } from "@/components/knowledge-reader";
import "../knowledge-directory.css";

export const metadata: Metadata = {
  title: "Developer Library",
  robots: { index: false, follow: false },
};

/** Renders one owner-only library module after the worker verifies the owner identity. */
export default async function KnowledgeModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ folder?: string; id?: string }>;
}) {
  const [{ module }, { folder, id }] = await Promise.all([params, searchParams]);
  if (module === "read") {
    if (!id) notFound();
    return <KnowledgeReader id={id} />;
  }
  if (!(["handbooks", "governance", "delivery", "assets"] as string[]).includes(module)) notFound();

  return <KnowledgeDirectory
    key={`${module}:${folder ?? "all-folders"}`}
    initialModule={module as KnowledgeModule}
    initialFolder={folder}
  />;
}
