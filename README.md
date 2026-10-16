# GemsForge Portfolio

Public portfolio: https://www.gemsforge.com  
Owner image manager: https://www.gemsforge.com/admin/

## Source

- `static-source/`: editable HTML pages and shared CSS/brand assets.
- `scripts/prepare-pages.mjs`: generates the server's HTML map and adds project gallery hooks.
- `build/sites-worker.ts`: preserves Sites/Vinext hosting integration and serves the portfolio and owner workspace.
- `lib/media-server.ts`: server-side owner authorization and persistent image APIs.
- `lib/image-manager.html`: owner upload/edit interface.
- `public/assets/image-manager.js`: owner image actions.
- `public/assets/gallery.js`: public project galleries.
- `tests/media.test.mjs`: authorization and draft/publish lifecycle tests.

## Image workflow

Visit `/admin/` and sign in with the ChatGPT account that owns this Site. Server authorization allows only the owner email verified for this project. Visitors can browse all public pages and published images without signing in.

Choose a project, upload a PNG/JPEG/WebP image (10 MB maximum), and add alt text and an optional caption. Uploads start as drafts. Review and select **Publish image** to make them visible in the project's gallery. **Unpublish** removes them from the gallery; previously cached image responses may remain available for up to 60 seconds. **Delete image** permanently deletes its stored data.

Images and metadata are stored in the provisioned R2 `BUCKET`, independently of code deployments. Do not change binding names or remove storage configuration during ordinary edits. Image bytes are not part of this source export. The code export is not a backup of uploaded images.

## Development and publishing

### UI organization

This is a React and TypeScript project. UI work follows the reusable,
component-driven workflow documented in
[`docs/ui-development-workflow.md`](docs/ui-development-workflow.md): route
entry points live in `app/`, shared primitives in `components/ui/`, reusable
application patterns in `components/`, stateful browser logic in `hooks/`, and
data/integration code in `lib/`.

This version adds a backend; the earlier Python static-server preview cannot run uploads or galleries.

Use the current Sites skill for installation, build, preview, source synchronization, and publishing to the existing project. Node.js 22.13+ is required. `npm run build` prepares static content then builds the server through the retained Sites integration. `npm run test:media` checks core storage and authorization behavior.

No application credentials belong in source. Hosted sign-in and identity headers are provided by Sites. Only the owner workspace requires sign-in. Browser-level visual/accessibility and hosted owner-login walkthroughs remain to be verified.
