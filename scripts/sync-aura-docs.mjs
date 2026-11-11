/**
 * Refreshes docs/aura-logbook/, the portfolio's snapshot of Aura Logbook's
 * public-facing Markdown documents, from GemsForge/aura-logbook-api.
 *
 * Usage: node scripts/sync-aura-docs.mjs [--ref <branch|commit>]
 * Set GITHUB_TOKEN (for example `GITHUB_TOKEN=$(gh auth token)`) to avoid
 * GitHub's anonymous rate limits.
 *
 * The snapshot keeps the source layout so links between copied files stay
 * relative. Every other link is rewritten by `rewriteLinks`:
 * - internal or missing targets are unlinked (or a list item that only
 *   pointed to them is dropped, along with a heading left empty), so the
 *   snapshot never points readers at excluded or 404 pages;
 * - images point to raw.githubusercontent.com so they render;
 * - folders point to github.com/…/tree/<sha>, files to …/blob/<sha>.
 * The copied README gets a snapshot banner, and SOURCE.md records the commit.
 */
import { realpathSync } from "node:fs";
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

/**
 * Inline Markdown link or image: optional "!", text that may hold one level of
 * nested brackets (so badge-in-link works), a target that is either <angled> or
 * whitespace-free, and an optional "title".
 */
export const LINK = /(!?)\[((?:[^[\]]|\[[^\]]*\])*)\]\(\s*(<[^>]+>|[^)\s]+)(\s+"[^"]*")?\s*\)/g;
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+/;
const HEADING = /^(#{1,6})\s/;

/**
 * Resolves a link target written in `file` to a source-repository path.
 * Returns null for external, absolute, and same-page (#anchor) targets.
 * Angle brackets are removed and percent-encoding is decoded, so "My%20Doc.md"
 * and "<My Doc.md>" both resolve to "My Doc.md".
 * @returns {{path: string, fragment: string, folder: boolean} | null}
 */
export function resolveLink(file, target) {
  const bare = target.replace(/^<|>$/g, "");
  if (/^[a-z][a-z0-9+.-]*:|^#|^\//i.test(bare)) return null;
  const [rawPath, ...rest] = bare.split("#");
  let decoded = rawPath;
  try { decoded = decodeURI(rawPath); } catch { /* keep malformed targets as written */ }
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), decoded));
  return { path: resolved.replace(/\/$/, ""), fragment: rest.join("#"), folder: decoded.endsWith("/") };
}

/** Encodes each path segment for use in a URL, keeping the slashes. */
const encodePath = (value) => value.split("/").map(encodeURIComponent).join("/");

/**
 * Rewrites the links in one copied Markdown file.
 * @param {string} markdown file contents
 * @param {string} file the file's source path (e.g. "docs/README.md")
 * @param {{sha: string, copied: Set<string>, lookup: (path: string) => ("file" | "dir" | undefined)}} context
 *   `copied` holds the snapshot's source paths; `lookup` reports whether a
 *   non-copied path is a file or folder in the source repository at `sha`.
 * @returns {string} the rewritten Markdown
 */
export function rewriteLinks(markdown, file, { sha, copied, lookup }) {
  const isHidden = (link) => !!link && !copied.has(link.path) && (isInternal(link.path) || !lookup(link.path));
  const rewrite = (text) => text.replace(LINK, (match, bang, label, target, title = "") => {
    const inner = rewrite(label); // badges inside link text get their own rewrite
    const link = resolveLink(file, target);
    if (!link) return `${bang}[${inner}](${target}${title})`;
    if (copied.has(link.path)) return `${bang}[${inner}](${target}${title})`;
    if (isHidden(link)) return bang ? "" : inner;
    const anchor = link.fragment ? `#${link.fragment}` : "";
    const kind = lookup(link.path) === "dir" || link.folder ? "tree" : "blob";
    const url = bang
      ? `https://raw.githubusercontent.com/${SOURCE_REPO}/${sha}/${encodePath(link.path)}`
      : `https://github.com/${SOURCE_REPO}/${kind}/${sha}/${encodePath(link.path)}${anchor}`;
    return `${bang}[${inner}](${url}${title})`;
  });

  const lines = markdown.split("\n");
  const kept = [];
  const emptied = new Set(); // indexes in `kept` of headings whose section lost a list item
  let heading = -1;
  for (const line of lines) {
    if (HEADING.test(line)) heading = kept.length;
    const links = [...line.matchAll(LINK)].map((match) => resolveLink(file, match[3]));
    // A list item whose every link is hidden only described pages readers cannot open: drop it.
    if (LIST_ITEM.test(line) && links.length && links.every((link) => isHidden(link))) {
      if (heading >= 0) emptied.add(heading);
      continue;
    }
    kept.push(rewrite(line));
  }
  // Drop a heading (and its leftover blank lines) when its section became empty because its only items were dropped.
  const drop = new Set();
  for (const index of emptied) {
    const level = HEADING.exec(kept[index])[1].length;
    const section = [index];
    let empty = true;
    for (let next = index + 1; next < kept.length; next += 1) {
      const nextHeading = HEADING.exec(kept[next]);
      if (nextHeading && nextHeading[1].length <= level) break;
      if (kept[next].trim()) { empty = false; break; }
      section.push(next);
    }
    if (empty) section.forEach((line) => drop.add(line));
  }
  return kept.filter((_line, index) => !drop.has(index)).join("\n");
}

/** Banner placed above the copied README so it is not mistaken for this repository's setup guide. */
export function snapshotBanner(sha) {
  return `> **Snapshot from [Aura Logbook](https://github.com/${SOURCE_REPO}/tree/${sha}).** This is Aura Logbook's README, copied for the portfolio case study. Commands below run in the Aura Logbook repository, not this one. See [SOURCE.md](SOURCE.md) for what was copied and how to refresh it.\n\n`;
}

/**
 * Text of docs/aura-logbook/SOURCE.md for a snapshot of `sha`, requested as
 * `ref` (a branch name, or a commit SHA), taken on `date` (YYYY-MM-DD).
 */
export function sourceNote(sha, date, ref = "master") {
  const requested = /^[0-9a-f]{7,40}$/i.test(ref) ? "requested by commit SHA" : `branch \`${ref}\``;
  return `# Aura Logbook documents (snapshot)

These Markdown files are a snapshot of the public-facing documentation for [Aura Logbook](https://github.com/${SOURCE_REPO}), copied for the portfolio's Aura Logbook case study (issue #120).

- **Source:** \`${SOURCE_REPO}\`, ${requested}, at commit [\`${sha.slice(0, 7)}\`](https://github.com/${SOURCE_REPO}/tree/${sha})
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

export const USAGE = "Usage: node scripts/sync-aura-docs.mjs [--ref <branch|commit>]";

/**
 * Parses the command line. Only `--ref <branch|commit>` and `--help` are
 * accepted, so a typo such as `--rev` fails instead of silently refreshing
 * from master. Returns `{ref}` (default "master"), `{help: true}`, or `{error}`.
 */
export function parseArgs(args) {
  let ref = "master";
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--ref" || arg.startsWith("--ref=")) {
      const value = arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : args[(index += 1)];
      if (!value || value.startsWith("--")) return { error: "--ref needs a branch name or commit SHA." };
      ref = value;
      continue;
    }
    return { error: `Unknown option: ${arg}` };
  }
  return { ref };
}

/** A failure with a message meant for the person running the script (printed without a stack trace). */
class UserError extends Error {}

const githubHeaders = () => ({
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

/**
 * Fetches a GitHub URL. Rate-limit responses (403/429) are retried once after
 * the delay GitHub asks for (capped at 10s); if they persist, the error says how
 * to raise the limit instead of showing a bare status code.
 */
async function githubFetch(url, options = {}) {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(url, { ...options, headers: { ...githubHeaders(), ...options.headers } });
    const limited = response.status === 429 || (response.status === 403 && (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after") || /rate limit/i.test(await response.clone().text())));
    if (!limited) return response;
    if (attempt === 0) {
      const wait = Math.min(Number(response.headers.get("retry-after")) || 2, 10);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      continue;
    }
    throw new UserError(`GitHub rate limit reached.${process.env.GITHUB_TOKEN ? " Wait a few minutes and try again." : " Set GITHUB_TOKEN (for example GITHUB_TOKEN=$(gh auth token)) and try again."}`);
  }
}

async function fetchText(url) {
  const response = await githubFetch(url);
  if (!response.ok) throw new UserError(`Could not download ${url} (HTTP ${response.status}).`);
  return response.text();
}

/** Runs `task` over `items` with at most `limit` in flight, so lookups don't trip GitHub's burst limits. */
async function mapLimit(items, limit, task) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await task(queue.shift());
  }));
}

async function main(args) {
  const options = parseArgs(args);
  if (options.help) { console.log(USAGE); return; }
  if (options.error) throw new UserError(`${options.error}\n${USAGE}`);
  const commitResponse = await githubFetch(`https://api.github.com/repos/${SOURCE_REPO}/commits/${encodeURIComponent(options.ref)}`);
  if (commitResponse.status === 404 || commitResponse.status === 422) throw new UserError(`No branch or commit named "${options.ref}" in ${SOURCE_REPO}.`);
  if (!commitResponse.ok) throw new UserError(`Could not look up "${options.ref}" in ${SOURCE_REPO} (HTTP ${commitResponse.status}).`);
  const sha = (await commitResponse.json()).sha;
  const raw = (file) => `https://raw.githubusercontent.com/${SOURCE_REPO}/${sha}/${file}`;
  const sources = {};
  await mapLimit(AURA_DOCS, 6, async (file) => { sources[file] = await fetchText(raw(file)); });

  // Look up every non-copied target once (file, folder, or missing) through the contents API,
  // which, unlike raw.githubusercontent.com, also recognizes folders. GITHUB_TOKEN raises the rate limit.
  const copied = new Set(AURA_DOCS);
  const targets = new Set();
  for (const file of AURA_DOCS) {
    for (const match of sources[file].matchAll(LINK)) {
      const link = resolveLink(file, match[3]);
      if (link && !copied.has(link.path) && !isInternal(link.path)) targets.add(link.path);
    }
  }
  const kinds = new Map();
  await mapLimit([...targets], 4, async (target) => {
    const response = await githubFetch(`https://api.github.com/repos/${SOURCE_REPO}/contents/${encodePath(target)}?ref=${sha}`);
    if (response.status === 404) return;
    if (!response.ok) throw new UserError(`Could not look up ${target} (HTTP ${response.status}).`);
    kinds.set(target, Array.isArray(await response.json()) ? "dir" : "file");
  });

  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "docs", "aura-logbook");
  await rm(root, { recursive: true, force: true });
  for (const file of AURA_DOCS) {
    const text = sources[file];
    const out = path.join(root, file);
    await mkdir(path.dirname(out), { recursive: true });
    const body = rewriteLinks(text, file, { sha, copied, lookup: (target) => kinds.get(target) });
    await writeFile(out, file === "README.md" ? snapshotBanner(sha) + body : body);
  }
  await writeFile(path.join(root, "SOURCE.md"), sourceNote(sha, new Date().toISOString().slice(0, 10), options.ref));
  const missing = [...targets].filter((target) => !kinds.has(target));
  console.log(`Copied ${AURA_DOCS.length} documents from ${SOURCE_REPO}@${sha.slice(0, 7)}.${missing.length ? ` Unlinked missing targets: ${missing.join(", ")}` : ""}`);
}

// Compare real paths: Node resolves import.meta.url through symlinks (e.g. /tmp → /private/tmp on macOS).
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    // Expected problems print one readable line; anything else keeps its stack for debugging.
    console.error(error instanceof UserError ? `error: ${error.message}` : error);
    process.exitCode = error instanceof UserError && /^--ref|^Unknown option/.test(error.message) ? 2 : 1;
  }
}
