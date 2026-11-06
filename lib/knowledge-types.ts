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

/** Describes one knowledge reference from the owner API or public catalogue. */
export type KnowledgeResource = {
  id: string;
  title: string;
  folder: string;
  filename: string;
  contentType: KnowledgeContentType;
  size: number;
  createdAt?: string;
  description?: string;
  tags?: string[];
  searchText?: string;
  /** Public URL for maintained Markdown stored with the site rather than R2. */
  sourceUrl?: string;
};
