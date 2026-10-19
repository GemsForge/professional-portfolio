/**
 * Stable project identities used by owner-managed attachments.
 *
 * This registry intentionally lives outside the public profile catalog. A
 * project can be hidden or removed from the profile without orphaning its
 * stored evidence or removing it from the attachment dropdown.
 */
export const PROJECT_REGISTRY = [
  { slug: "hair-log", label: "Hair Care Log" },
  { slug: "75-hard-automation", label: "75 Days of Discipline" },
  { slug: "auralogbook", label: "Aura Logbook" },
  { slug: "apple-ecosystem", label: "Apple-native operating system" },
  { slug: "dynamic-folder-structures", label: "Dynamic folder structures" },
  { slug: "notion-api-shortcuts", label: "Notion API integration" },
] as const;

export const PROJECTS = PROJECT_REGISTRY.map(({ slug }) => slug) as [string, ...string[]];

export const PROJECT_OPTIONS_HTML = PROJECT_REGISTRY
  .map(({ slug, label }) => `<option value="${slug}">${label}</option>`)
  .join("");
