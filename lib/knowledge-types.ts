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

/** Describes a library reference; the public index returns metadata without body-derived fields. */
export type KnowledgeResource = {
  id: string;
  title: string;
  folder: string;
  filename: string;
  contentType: KnowledgeContentType;
  size: number;
  createdAt: string;
  description?: string;
  tags?: string[];
  searchText?: string;
};
