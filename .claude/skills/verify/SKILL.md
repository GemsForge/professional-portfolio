---
name: verify
description: How to run and observe this portfolio's changes (static pages, pop-ups, admin forms, docs refresh script) without the hosted worker or owner sign-in.
---

# Verify recipe (professional-portfolio)

## Static pages and the profile pop-ups
1. `node scripts/prepare-pages.mjs` writes `lib/static-pages.json` and copies `static-source/assets` to `public/assets`.
2. Export a static preview (no worker needed):
   ```bash
   P=$(mktemp -d) && cp -R public/. "$P"/ && node -e 'const p=require("./lib/static-pages.json");const fs=require("fs");for(const [r,h] of Object.entries(p)){const d=process.argv[1]+r;fs.mkdirSync(d,{recursive:true});fs.writeFileSync(d+"index.html",h)}' "$P"
   python3 -m http.server 4108 --directory "$P"
   ```
3. Drive in the browser pane: `/#post/auralogbook` opens a pop-up; check stepping, Close, and focus with `javascript_tool`.
- Gotcha: assets have no cache-busting except versioned links. After edits, `fetch(url,{cache:'reload'})` then reload, or you'll test stale JS/CSS.
- `/api/media` doesn't exist in the static preview. Stub `window.fetch` in the page to simulate published uploads.

## Admin page (`lib/image-manager.html`)
Owner sign-in can't be automated. To check the form UI, render it statically: replace `<!--PROJECT_OPTIONS-->` and `<!--WALKTHROUGH_STEPS-->` the way `build/sites-worker.ts` does, and serve it from the preview folder. Uploads can't be exercised there.

## Docs refresh (`scripts/sync-aura-docs.mjs`)
- Run it in a throwaway clone (`git clone --depth 1 --branch <branch> …` into `mktemp -d`), never in the working tree.
- `--ref <sha>` should reproduce the committed `docs/aura-logbook/` exactly (`git status` stays clean).
- Set `GITHUB_TOKEN=$(gh auth token)` before running. Without it, roughly 30 parallel contents-API calls can hit GitHub's burst limit (403).
- zsh doesn't word-split `$var` in `for` loops. Use `while read` over a file to check URL lists.
