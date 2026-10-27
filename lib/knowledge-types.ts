/** Enumerates file formats accepted by the private knowledge library. */
export type KnowledgeContentType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/markdown"
  | "text/plain"
  | "text/html"
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/tiff";

/** Describes one owner-only reference returned by the knowledge library API. */
export type KnowledgeResource = {
  id: string;
  title: string;
  folder: string;
  filename: string;
  contentType: KnowledgeContentType;
  size: number;
  createdAt: string;
};
