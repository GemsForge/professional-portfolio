# Publishing this repository through Sites

This runbook covers production publishing for the existing Professional
Portfolio Sites project. Its production URL is `https://www.gemsforge.com`.
The project ID and the `BUCKET` R2 binding are recorded in
`.openai/hosting.json`; preserve them during ordinary deployments.

## Source of truth

- GitHub `main` is the source of truth for portfolio code and content.
- The Sites project has its own connected source repository and deploys from
  that repository's `main` branch. A push to GitHub does not, by itself,
  publish the live site.
- Publish only a GitHub `main` commit that is confirmed to contain the intended
  changes. Do not deploy an unmerged feature branch or build output from a
  different local commit.
- A local checkout may be behind GitHub. Confirm the latest GitHub `main` SHA
  through GitHub or a successful fetch before preparing a deployment. If the
  local repository cannot be refreshed, use the Sites source workflow to
  synchronize the confirmed remote commit; do not treat a stale
  `origin/main` tracking ref as current evidence.
- Keep unrelated local edits out of the deployment source. The Sites source
  workflow must package the exact checkout state it pushed to the connected
  Sites source repository. Keep both the GitHub `main` SHA (content provenance)
  and the Sites source SHA (deployment input) in the delivery record; they may
  differ because Sites uses its own connected source repository.

## Production publishing sequence

1. Confirm the requested site changes are merged into GitHub `main`. Record
   the full commit SHA and inspect the changed files so the deployment scope is
   clear.
2. Read `.openai/hosting.json` and retrieve the existing Sites project. Do not
   create a second Site. Preserve the existing production audience and storage
   bindings.
3. Use the current Sites source workflow for this existing project. When its
   source credential is missing or expired, request a short-lived credential
   through Sites and pass it only through the supported workflow. Never put a
   credential in source, command-line arguments, logs, or this document.
4. Synchronize the confirmed GitHub `main` source state to the connected Sites
   source repository's `main`. Build and package through the supported Sites
   workflow from the exact state that it pushed. For this Worker-backed
   application, the archive must contain
   `.openai/hosting.json` and the built Worker entry point; do not substitute
   a static export or the source tree for deployment output.
5. Confirm the GitHub source state was synchronized correctly, record the
   Sites workflow's returned source SHA, and confirm build/package steps
   succeeded. Save a Sites version with that Sites SHA and its matching
   archive, then deploy that saved version. This project is public,
   so use the public deployment operation and preserve its current access
   setting.
6. If the deployment is pending, building, or publishing, check its status
   until it reaches a terminal state. A successful result and production URL
   are the deployment evidence; do not report success based only on a push or
   a saved version.
7. Confirm the published version/source SHA in Sites and open
   `https://www.gemsforge.com` to verify the expected page is live. If the
   browser still shows the previous page, check the deployment's version and
   source SHA first, then account for browser/CDN caching before retrying a
   production publish.

## Build versus deployment

There are separate steps here, and a successful build does not mean a
deployment is underway:

1. **Local application build:** `npm run build` compiles the repository into
   Worker output, including `dist/server/index.js`. This can complete without
   contacting the Sites source repository.
2. **Open the Sites source checkout:** the Sites workflow contacts its own
   source host and reads the existing project's `main` branch. This happens
   before any build commands supplied to that workflow. It needs network
   access and a valid short-lived Sites source credential.
3. **Build, save source, and package:** after opening the checkout, the Sites
   workflow runs the requested build commands, pushes the resulting source
   state, and packages the matching Worker output.
4. **Save and deploy:** Sites saves a version from the pushed source SHA and
   matching archive, then deploys that saved version to production.

For example, a separately run local build may report `Build complete` while
the Sites workflow fails before its own build commands with a DNS error such
as `Could not resolve host: git.chatgpt-team.site`. In that case, the local
compilation succeeded, but the Sites workflow never opened its source checkout
or ran its build. No source was pushed, no Sites version was saved, and no
production deployment started; the live site remains on its previous version.
Do not retry the save/deploy call with the GitHub SHA alone: it must match the
connected Sites source branch.

When source sync cannot resolve the Sites host, preserve the completed build
and its source checkout, report the exact network error, and retry the Sites
workflow only after that host is reachable. After a successful sync, confirm
the pushed Sites SHA and then continue with save, deploy, and status checks.
Do not force-push, recreate the Site, or change its access settings to work
around a connectivity failure.

## Routine checks and boundaries

- The repository's `npm run build` runs `scripts/prepare-pages.mjs` before
  building the Worker. Use the current Sites workflow for the actual
  deployment build and packaging so its archive matches the pushed source.
- Pull requests run the checks in `.github/workflows/ci.yml`; deployment is a
  separate, explicit production action after changes reach `main`.
- Do not change the R2 binding name or assume uploaded media and Wiki files
  are included in a code archive. They remain in the existing `BUCKET`.
- Do not create a new Site, change public access, alter secrets, or delete
  production data as part of an ordinary deployment.
