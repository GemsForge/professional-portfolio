# Deploying this repository to Cloudflare

This runbook covers production deployment of the Professional Portfolio to the
owner's Cloudflare account. The site runs as the `gemsforge-portfolio` Worker
and is served at `https://www.gemsforge.com` and `https://gemsforge.com`.

## How it is wired

- `vite.config.ts` holds the Worker configuration that the Cloudflare Vite
  plugin writes into `dist/server/wrangler.json` at build time: the Worker
  name, the `gemsforge.com` / `www.gemsforge.com` custom domains, the
  `BUCKET` R2 binding (bucket `gemsforge-portfolio`), `nodejs_compat`, and the
  non-secret Cloudflare Access identifiers `ACCESS_TEAM_DOMAIN` and
  `ACCESS_AUD`.
- `npm run build` also writes `.wrangler/deploy/config.json`, which points
  `wrangler deploy` at the generated `dist/server/wrangler.json`. Do not keep a
  hand-written `wrangler.json`/`wrangler.toml` at the repository root; change
  `vite.config.ts` instead.
- `build/sites-worker.ts` is the Worker entry point. In production every
  request passes through the Cloudflare Access bridge in
  `lib/cloudflare-access.ts`, which strips spoofed
  `oai-authenticated-user-*` headers and re-derives them from a verified
  Access JWT so the owner-only checks keep working.
- `.openai/hosting.json` still supplies the binding names (`r2: "BUCKET"`,
  `d1: null`) read by `vite.config.ts`. Keep it; its `project_id` refers to
  the retired Sites project and is not used for Cloudflare deployments.

## Source of truth

- GitHub `main` is the source of truth for portfolio code and content.
- Deployment is a manual, explicit production action. No workflow in
  `.github/workflows/` deploys; pull requests only run the checks in `ci.yml`.
- Deploy only a clean checkout of a confirmed GitHub `main` commit. Do not
  deploy a feature branch or a working tree with unrelated local edits, and
  record the deployed `main` SHA in the delivery report.

## One-time account setup

Already complete for the current production site; repeat only when rebuilding
the account or moving to a new one.

1. Sign Wrangler in to the owner's Cloudflare account:
   `npx wrangler login`, then confirm with `npx wrangler whoami`.
2. Create the R2 bucket if it does not exist:
   `npx wrangler r2 bucket create gemsforge-portfolio`. Uploaded images and
   Wiki files live only in this bucket; they are not part of the code and must
   be migrated separately (for example from the former Sites bucket).
3. Add `gemsforge.com` as a zone in the same account. Remove any existing DNS
   records for `gemsforge.com` and `www.gemsforge.com` (such as the old Sites
   CNAMEs) so `wrangler deploy` can attach the Worker custom domains.
4. In Cloudflare Zero Trust, create a self-hosted Access application that
   protects the owner paths (admin, media and knowledge management) and allows
   only the owner's identity. Its team domain and Audience (AUD) tag must
   match `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in `vite.config.ts`.

## Production deployment sequence

1. Confirm the requested changes are merged into GitHub `main`. Record the
   full commit SHA and review the changed files.
2. Check out that commit in a clean working tree:
   `git fetch origin && git switch main && git pull --ff-only`, then
   `git status` must show no local changes.
3. Install dependencies with `npm run install:ci` (Node.js 22.13+).
4. Build: `npm run build`. This runs `scripts/prepare-pages.mjs`, then builds
   the Worker into `dist/server/` and static assets into `dist/client/`.
   Confirm `dist/server/wrangler.json` lists the expected name, routes and
   `BUCKET` binding.
5. Deploy: `npx wrangler deploy`. Wrangler reads the generated config through
   `.wrangler/deploy/config.json`. A successful run prints the uploaded
   version ID and the `gemsforge.com` / `www.gemsforge.com` routes.
6. Confirm the deployment: `npx wrangler deployments list` shows the new
   version as active.
7. Verify production in a browser:
   - `https://www.gemsforge.com` shows the expected changes.
   - Opening an owner page redirects to Cloudflare Access sign-in, and after
     signing in the owner workspace loads.
   - Existing media still loads from R2.
   If the browser shows the previous version, check the active deployment
   first, then account for browser/CDN caching.

## Rollback

`npx wrangler rollback` restores the previous Worker version (list versions
with `npx wrangler deployments list`). Rollback affects code only; R2 data is
unchanged.

## Boundaries

- Never put credentials in source, command-line arguments, logs or this
  document. `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` are public identifiers, not
  secrets; any real secret must be set with `npx wrangler secret put`.
- Do not rename the `BUCKET` binding, change the bucket name, or remove
  storage configuration during ordinary deployments.
- Do not change the Access application, DNS, custom domains, or delete
  production data as part of an ordinary deployment.
- Use `npx wrangler tail gemsforge-portfolio` to read live logs when a
  deployment misbehaves.
