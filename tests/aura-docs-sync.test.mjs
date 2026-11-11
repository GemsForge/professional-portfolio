import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { AURA_DOCS, INTERNAL_DOCS, rewriteLinks } from "../scripts/sync-aura-docs.mjs";

const sha = "0123456789abcdef0123456789abcdef01234567";
const context = { sha, copied: new Set(AURA_DOCS), exists: (target) => target !== "docs/ux/missing.md" };

test("links between copied documents stay relative", () => {
  assert.equal(rewriteLinks("See [ERD](database-erd.md#tables).", "docs/README.md", context), "See [ERD](database-erd.md#tables).");
});

test("public non-copied targets are pinned, and images use raw URLs so they render", () => {
  assert.equal(
    rewriteLinks("[API](../AuraLogbook.Api/README.md)", "docs/README.md", context),
    `[API](https://github.com/GemsForge/aura-logbook-api/blob/${sha}/AuraLogbook.Api/README.md)`,
  );
  assert.equal(
    rewriteLinks("![Proposal](assets/p.png)", "docs/ux/prism-garden-visual-system.md", context),
    `![Proposal](https://raw.githubusercontent.com/GemsForge/aura-logbook-api/${sha}/docs/ux/assets/p.png)`,
  );
});

test("internal and missing targets are unlinked, and index bullets that lead with them are dropped", () => {
  assert.equal(rewriteLinks("See [recovery](database-recovery.md) first.", "docs/runtime-environments.md", context), "See recovery first.");
  assert.equal(rewriteLinks("and the [plan](missing.md) documents #219.", "docs/ux/core-user-journeys.md", context), "and the plan documents #219.");
  assert.equal(rewriteLinks("- [Cleanup](../BRANCH_CLEANUP.md) — procedure.\n- [ERD](database-erd.md)", "docs/README.md", context), "- [ERD](database-erd.md)");
  assert.equal(rewriteLinks("- [Workflow](.github/ISSUE_WORKFLOW.md)", "README.md", context), "");
});

test("the committed snapshot links to no internal page and labels its README as a snapshot", async () => {
  const root = new URL("../docs/aura-logbook/", import.meta.url);
  const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith(".md"));
  assert.equal(files.length, AURA_DOCS.length + 1, "21 documents plus SOURCE.md");
  for (const file of files) {
    const text = await readFile(new URL(file, root), "utf8");
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const pinned = target.match(/aura-logbook-api\/(?:blob\/)?[0-9a-f]{40}\/([^#)]+)/);
      const local = !/^[a-z]+:|^#/i.test(target) && path.posix.normalize(path.posix.join(path.posix.dirname(file.split(path.sep).join("/")), target.split("#")[0]));
      const resolved = pinned?.[1] ?? local;
      if (!resolved) continue;
      assert.ok(!INTERNAL_DOCS.some((entry) => (entry.endsWith("/") ? resolved.startsWith(entry) : resolved === entry)), `${file} links to internal ${resolved}`);
      if (local) assert.ok(files.map((name) => name.split(path.sep).join("/")).includes(local), `${file} has a broken local link to ${local}`);
    }
  }
  const readme = await readFile(new URL("README.md", root), "utf8");
  assert.match(readme, /^> \*\*Snapshot from \[Aura Logbook\]/);
  assert.match(readme, /\[SOURCE\.md\]\(SOURCE\.md\)/);
});
