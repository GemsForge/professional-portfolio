import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { AURA_DOCS, INTERNAL_DOCS, LINK, parseArgs, resolveLink, rewriteLinks } from "../scripts/sync-aura-docs.mjs";

const sha = "0123456789abcdef0123456789abcdef01234567";
const kinds = new Map([["AuraLogbook.Api/README.md", "file"], ["aura-ui/src", "dir"], ["docs/ux/assets/p.png", "file"], ["img/badge.svg", "file"], ["My Guide.md", "file"]]);
const context = { sha, copied: new Set([...AURA_DOCS, "docs/Aura Guide.md"]), lookup: (target) => kinds.get(target) };
const isInternal = (target) => INTERNAL_DOCS.some((entry) => (entry.endsWith("/") ? target.startsWith(entry) : target === entry));

test("resolveLink skips external, absolute, and same-page targets and decodes the rest", () => {
  assert.equal(resolveLink("docs/README.md", "https://example.com/x"), null);
  assert.equal(resolveLink("docs/README.md", "#tables"), null);
  assert.equal(resolveLink("docs/README.md", "/root.md"), null);
  assert.deepEqual(resolveLink("docs/README.md", "../My%20Guide.md#top"), { path: "My Guide.md", fragment: "top", folder: false });
  assert.deepEqual(resolveLink("docs/README.md", "<Aura Guide.md>"), { path: "docs/Aura Guide.md", fragment: "", folder: false });
  assert.deepEqual(resolveLink("README.md", "aura-ui/src/"), { path: "aura-ui/src", fragment: "", folder: true });
});

test("links between copied documents stay relative, including encoded and titled ones", () => {
  assert.equal(rewriteLinks("See [ERD](database-erd.md#tables).", "docs/README.md", context), "See [ERD](database-erd.md#tables).");
  assert.equal(rewriteLinks('[Guide](Aura%20Guide.md "Read me")', "docs/README.md", context), '[Guide](Aura%20Guide.md "Read me")');
});

test("public targets are pinned: files to blob, folders to tree, images to raw", () => {
  assert.equal(
    rewriteLinks('[API](../AuraLogbook.Api/README.md "API docs")', "docs/README.md", context),
    `[API](https://github.com/GemsForge/aura-logbook-api/blob/${sha}/AuraLogbook.Api/README.md "API docs")`,
  );
  assert.equal(rewriteLinks("[UI](aura-ui/src/)", "README.md", context), `[UI](https://github.com/GemsForge/aura-logbook-api/tree/${sha}/aura-ui/src)`);
  assert.equal(
    rewriteLinks("![Proposal](assets/p.png)", "docs/ux/prism-garden-visual-system.md", context),
    `![Proposal](https://raw.githubusercontent.com/GemsForge/aura-logbook-api/${sha}/docs/ux/assets/p.png)`,
  );
  assert.equal(
    rewriteLinks("[![Badge](img/badge.svg)](AuraLogbook.Api/README.md)", "README.md", context),
    `[![Badge](https://raw.githubusercontent.com/GemsForge/aura-logbook-api/${sha}/img/badge.svg)](https://github.com/GemsForge/aura-logbook-api/blob/${sha}/AuraLogbook.Api/README.md)`,
  );
  assert.equal(rewriteLinks("[Guide](../My%20Guide.md)", "docs/README.md", context), `[Guide](https://github.com/GemsForge/aura-logbook-api/blob/${sha}/My%20Guide.md)`);
});

test("internal and missing targets are unlinked; items with only hidden links are dropped", () => {
  assert.equal(rewriteLinks("See [recovery](database-recovery.md) first.", "docs/runtime-environments.md", context), "See recovery first.");
  assert.equal(rewriteLinks("and the [plan](missing.md) documents #219.", "docs/ux/core-user-journeys.md", context), "and the plan documents #219.");
  assert.equal(rewriteLinks("- [Cleanup](../BRANCH_CLEANUP.md) — procedure.\n- [ERD](database-erd.md)", "docs/README.md", context), "- [ERD](database-erd.md)");
  assert.equal(rewriteLinks("1. [Workflow](.github/ISSUE_WORKFLOW.md)\n2. [Overview](AURA_PROJECT_OVERVIEW.md)", "README.md", context), "2. [Overview](AURA_PROJECT_OVERVIEW.md)");
  // A list item that still has a visible link keeps it and loses only the hidden one.
  assert.equal(
    rewriteLinks("- [Recovery](database-recovery.md) — see also [ERD](database-erd.md)", "docs/README.md", context),
    "- Recovery — see also [ERD](database-erd.md)",
  );
});

test("a heading whose only items were dropped is removed with them", () => {
  const markdown = "## Operations\n\n- [Cleanup](../BRANCH_CLEANUP.md)\n\n## Data\n\n- [ERD](database-erd.md)";
  assert.equal(rewriteLinks(markdown, "docs/README.md", context), "## Data\n\n- [ERD](database-erd.md)");
});

test("the committed snapshot links to no internal page and labels its README as a snapshot", async () => {
  const root = new URL("../docs/aura-logbook/", import.meta.url);
  const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith(".md")).map((file) => file.split(path.sep).join("/"));
  assert.equal(files.length, AURA_DOCS.length + 1, "21 documents plus SOURCE.md");
  for (const file of files) {
    const text = await readFile(new URL(file, root), "utf8");
    for (const match of text.matchAll(LINK)) {
      const target = match[3];
      const pinned = target.match(/aura-logbook-api\/(?:(?:blob|tree)\/)?[0-9a-f]{40}\/([^#)]+)/);
      const local = resolveLink(file, target);
      const resolved = pinned ? decodeURI(pinned[1]) : local?.path;
      if (!resolved) continue;
      assert.ok(!isInternal(resolved), `${file} links to internal ${resolved}`);
      if (!pinned && local) assert.ok(files.includes(local.path), `${file} has a broken local link to ${local.path}`);
    }
  }
  const readme = await readFile(new URL("README.md", root), "utf8");
  assert.match(readme, /^> \*\*Snapshot from \[Aura Logbook\]/);
  assert.match(readme, /\[SOURCE\.md\]\(SOURCE\.md\)/);
});

test("the command line accepts only --ref and --help, and rejects typos and missing values", () => {
  assert.deepEqual(parseArgs([]), { ref: "master" });
  assert.deepEqual(parseArgs(["--ref", "3a93ed2"]), { ref: "3a93ed2" });
  assert.deepEqual(parseArgs(["--ref=main"]), { ref: "main" });
  assert.deepEqual(parseArgs(["--help"]), { help: true });
  assert.deepEqual(parseArgs(["--ref"]), { error: "--ref needs a branch name or commit SHA." });
  assert.deepEqual(parseArgs(["--ref", "--help"]), { error: "--ref needs a branch name or commit SHA." });
  assert.deepEqual(parseArgs(["--rev", "3a93ed2"]), { error: "Unknown option: --rev" });
});
