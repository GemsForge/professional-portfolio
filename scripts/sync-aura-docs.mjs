/**
 * Refreshes docs/aura-logbook/, the portfolio's snapshot of Aura Logbook's
 * public-facing Markdown documents, from GemsForge/aura-logbook-api.
 *
 * Usage: node scripts/sync-aura-docs.mjs [--ref master|<commit>]
 *
 * The snapshot keeps the source layout so links between copied files stay
 * relative. Every other link is rewritten by `rewriteLinks`:
 * - internal or missing targets are unlinked (or their index bullet dropped),
 *   so the snapshot never points readers at excluded or 404 pages;
 * - images point to raw.githubusercontent.com so they render;
 * - all other targets point to github.com, pinned to the copied commit.
 * The copied README gets a snapshot banner, and SOURCE.md records the commit.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE_REPO = "GemsForge/aura-logbook-api";

/** Public-facing documents copied into the snapshot, by source path. */
export const AURA_DOCS = [
  "README.md",
  "AURA_PROJECT_OVERVIEW.md",
  "DEPENDENCIES.md",
  "docs/README.md",
  "docs/ux/core-user-journeys.md",
  "docs/ux/experience-principles.md",
  "docs/ux/luminous-journal.md",
  "docs/ux/mobile-shell.md",
  "docs/ux/prism-garden-visual-system.md",
  "docs/ux/responsive-accessibility.md",
  "docs/wiki/README.md",
  "docs/wiki/aura-log-architecture.md",
  "docs/wiki/chakra-synonym-mood-types.md",
  "docs/wiki/home.md",
  "docs/wiki/setup-guide.md",
  "docs/wiki/spiritual-pathways.md",
  "docs/spotify-integration.md",
  "docs/database-erd.md",
  "docs/mood-combination-reflections.md",
  "docs/private-media-attachments.md",
  "docs/runtime-environments.md",
];

/** Internal documents the snapshot must not copy or link to (exact paths or folder prefixes). */
export const INTERNAL_DOCS = [
  "AGENTS.md",
  ".github/",
  "docs/governance/",
  "BRANCH_CLEANUP.md",
  "docs/configuration-and-secrets.md",
  "docs/database-recovery.md",
  "docs/registration-dateonly-mismatch.md",
  "docs/story-and-delivery-workflows.md",
  "Claude outputs/",
];

const isInternal = (target) => INTERNAL_DOCS.some((entry) => (entry.endsWith("/") ? target.startsWith(entry) : target === entry));
const LINK = /(!?)\[([^\]]*)\]\(([^)\s]+)\)/g;
const LIST_ITEM = /^\s*[-*]\s+(?:!?\[[^\]]*\]\([^)\s]+\))/;

/**
 * Rewrites the links in one copied Markdown file.
 * @param {string} markdown file contents
 * @param {string} file the file's source path (e.g. "docs/README.md")
 * @param {{sha: string, copied: Set<string>, exists: (target: string) => boolean}} context
 *   `copied` holds the snapshot's source paths; `exists` reports whether a
 *   non-copied target exists in the source repository at `sha`.
 * @returns {string} the rewritten Markdown
 */
export function rewriteLinks(markdown, file, { sha, copied, exists }) {
  const resolveTarget = (target) => path.posix.normalize(path.posix.join(path.posix.dirname(file), target));
  const hidden = (target) => {
    const [targetPath] = target.split("#");
    if (/^[a-z]+:|^#|^\//i.test(target)) return false;
    const resolved = resolveTarget(targetPath);
    return !copied.has(resolved) && (isInternal(resolved) || !exists(resolved));
  };
  return markdown.split("\n").flatMap((line) => {
    // An index bullet that leads with a hidden link describes a page readers cannot open: drop it.
    const first = LINK.exec(line);
    LINK.lastIndex = 0;
    if (first && LIST_ITEM.test(line) && hidden(first[3])) return [];
    return [line.replace(LINK, (match, bang, text, target) => {
      if (/^[a-z]+:|^#|^\//i.test(target)) return match;
      const [targetPath, fragment] = target.split("#");
      const resolved = resolveTarget(targetPath);
      if (copied.has(resolved)) return match;
      if (hidden(target)) return bang ? "" : text;
      const anchor = fragment ? `#${fragment}` : "";
      return bang
        ? `![${text}](https://raw.githubusercontent.com/${SOURCE_REPO}/${sha}/${resolved})`
        : `[${text}](https://github.com/${SOURCE_REPO}/blob/${sha}/${resolved}${anchor})`;
    })];
  }).join("\n");
}

/** Banner placed above the copied README so it is not mistaken for this repository's setup guide. */
export function snapshotBanner(sha) {
  return `> **Snapshot from [Aura Logbook](https://github.com/${SOURCE_REPO}/tree/${sha}).** This is Aura Logbook's README, copied for the portfolio case study. Commands below run in the Aura Logbook repository, not this one. See [SOURCE.md](SOURCE.md) for what was copied and how to refresh it.\n\n`;
}

/** Text of docs/aura-logbook/SOURCE.md for a snapshot of `sha` taken on `date` (YYYY-MM-DD). */
export function sourceNote(sha, date) {
  return `# Aura Logbook documents (snapshot)

These Markdown files are a snapshot of the public-facing documentation for [Aura Logbook](https://github.com/${SOURCE_REPO}), copied for the portfolio's Aura Logbook case study (issue #120).

- **Source:** \`${SOURCE_REPO}\`, commit [\`${sha.slice(0, 7)}\`](https://github.com/${SOURCE_REPO}/tree/${sha})
- **Copied:** ${date}
- **Layout:** paths match the source repository, so links between these files work. Links to other public files point to the source repository at that commit; links to internal or missing pages are removed.
- **Not included:** internal agent, governance, branch-cleanup, configuration, recovery-runbook, investigation, and AI output notes.

This is a dated copy. To refresh it from the latest Aura Logbook \`master\`, run:

\`\`\`bash
node scripts/sync-aura-docs.mjs
\`\`\`

The source repository stays the source of truth.
`;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response.text();
}

async function main() {
  const refIndex = process.argv.indexOf("--ref");
  const ref = refIndex > 0 ? process.argv[refIndex + 1] : "master";
  const commit = JSON.parse(await fetchText(`https://api.github.com/repos/${SOURCE_REPO}/commits/${encodeURIComponent(ref)}`));
  const sha = commit.sha;
  const raw = (file) => `https://raw.githubusercontent.com/${SOURCE_REPO}/${sha}/${file}`;
  const sources = Object.fromEntries(await Promise.all(AURA_DOCS.map(async (file) => [file, await fetchText(raw(file))])));

  // Check every non-copied target once, so missing pages are unlinked instead of pinned to a 404.
  const copied = new Set(AURA_DOCS);
  const targets = new Set();
  for (const [file, text] of Object.entries(sources)) {
    for (const [, , , target] of text.matchAll(LINK)) {
      if (/^[a-z]+:|^#|^\//i.test(target)) continue;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target.split("#")[0]));
      if (!copied.has(resolved) && !isInternal(resolved)) targets.add(resolved);
    }
  }
  const present = new Set();
  await Promise.all([...targets].map(async (target) => {
    const response = await fetch(raw(target), { method: "HEAD" });
    if (response.ok) present.add(target);
  }));

  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "docs", "aura-logbook");
  await rm(root, { recursive: true, force: true });
  for (const [file, text] of Object.entries(sources)) {
    const out = path.join(root, file);
    await mkdir(path.dirname(out), { recursive: true });
    const body = rewriteLinks(text, file, { sha, copied, exists: (target) => present.has(target) });
    await writeFile(out, file === "README.md" ? snapshotBanner(sha) + body : body);
  }
  await writeFile(path.join(root, "SOURCE.md"), sourceNote(sha, new Date().toISOString().slice(0, 10)));
  const missing = [...targets].filter((target) => !present.has(target));
  console.log(`Copied ${AURA_DOCS.length} documents from ${SOURCE_REPO}@${sha.slice(0, 7)}.${missing.length ? ` Unlinked missing targets: ${missing.join(", ")}` : ""}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
