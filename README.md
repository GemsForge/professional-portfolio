# GemsForge Portfolio

Public portfolio: https://www.gemsforge.com  
Owner image manager: https://www.gemsforge.com/admin/

## Source

- `static-source/`: editable HTML pages and shared CSS/brand assets.
- `scripts/prepare-pages.mjs`: generates the server's HTML map and adds project gallery hooks.
- `build/sites-worker.ts`: preserves Sites/Vinext hosting integration and serves the portfolio and owner workspace.
- `lib/media-server.ts`: server-side owner authorization and persistent image APIs.
- `lib/image-manager.html`: owner upload/edit interface.
- `app/admin/knowledge/page.tsx` and `components/knowledge-directory.tsx`: React/TypeScript owner-only library homepage and reference controls.
- `lib/knowledge-server.ts`: private R2 storage API for the owner library.
- `public/assets/image-manager.js`: owner image actions.
- `public/assets/gallery.js`: public project galleries.
- `tests/media.test.mjs`: authorization and draft/publish lifecycle tests.

## Image workflow

Visit `/admin/` and sign in with the ChatGPT account that owns this Site. Server authorization allows only the owner email verified for this project. Visitors can browse all public pages and published images without signing in.

Choose a project, upload a PNG/JPEG/WebP image (10 MB maximum), and add alt text and an optional caption. Uploads start as drafts. Review and select **Publish image** to make them visible in the project's gallery. **Unpublish** removes them from the gallery; previously cached image responses may remain available for up to 60 seconds. **Delete image** permanently deletes its stored data.

Images and metadata are stored in the provisioned R2 `BUCKET`, independently of code deployments. Do not change binding names or remove storage configuration during ordinary edits. Image bytes are not part of this source export. The code export is not a backup of uploaded images.

## Knowledge directory

Visit `/admin/knowledge/` from the owner workspace for the private React library homepage. It links to separate Handbooks, Governance, Delivery, and Assets module pages. Each module organizes its folders and saved references, with controls to add and search PDF, DOCX, Markdown, HTML, UTF-8 text, and common image references. HTML and Markdown files have a reusable reading view: HTML is served only to an isolated, restrictive preview frame, while Markdown is rendered as text without executing embedded HTML. Original files remain downloadable. Files and titles are stored under a separate `owner-knowledge/` prefix in the existing R2 `BUCKET`; every page and API request requires the portfolio owner's authenticated identity. Uploaded knowledge files are not part of this source export.

## Development and publishing

### UI organization

This is a React and TypeScript project. UI work follows the reusable,
component-driven workflow documented in
[`docs/ui-development-workflow.md`](docs/ui-development-workflow.md): route
entry points live in `app/`, shared primitives in `components/ui/`, reusable
application patterns in `components/`, stateful browser logic in `hooks/`, and
data/integration code in `lib/`.

Use [`docs/story-and-delivery-workflow.md`](docs/story-and-delivery-workflow.md)
for the required issue story structure, title and commit format, branch naming,
PR linking, labels, and checks.

This version adds a backend; the earlier Python static-server preview cannot run uploads or galleries.

Local mock sign-in defaults to the portfolio owner email. Set
`SITES_LOCAL_AUTH_EMAIL` before `npm run dev` only if you need to override it.
The mock sign-in is loopback-only; production authorization continues to use
the identity supplied by Sites.

Local development uses port `5173` by default. Both `npm run dev` and the local
worker preview started by `npm run start` read the same override: set `PORT` (or
`VITE_PORT` when `PORT` is not set) to a value from `1` through `65535`.
For example, `PORT=5199 npm run dev` serves the app at
`http://127.0.0.1:5199`. Hosted deployments retain their platform-assigned port.

Use the current Sites skill for installation, build, preview, source synchronization, and publishing to the existing project. Node.js 22.13+ is required. `npm run build` prepares static content then builds the server through the retained Sites integration. `npm run test:media` checks core storage and authorization behavior.

No application credentials belong in source. Hosted sign-in and identity headers are provided by Sites. Only the owner workspace requires sign-in. Browser-level visual/accessibility and hosted owner-login walkthroughs remain to be verified.
