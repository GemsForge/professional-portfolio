# UI development workflow

This project follows the GemsForge React and TypeScript coding policy and the
Gem Life UI architecture notes.

## Boundaries

- `app/` owns route-level pages, document metadata, and application entry points.
- `components/ui/` owns reusable visual and semantic primitives.
- `components/` owns shared application patterns and cross-page composition.
- `hooks/` owns reusable client-side state and browser interaction logic.
- `lib/` owns data access, server integration, validation, and non-visual helpers.
- `public/` owns files served directly to the browser.
- `components/case-studies/` owns the portfolio case study pages. They are React components rendered to static HTML at build time (`scripts/render-case-studies.mjs`), so they may import only `react`, sibling files with explicit `.tsx` extensions, and types from elsewhere; catalog data arrives as props.
- `static-source/` owns the remaining editable HTML pages and brand assets used by the site generator.
- `scripts/` owns build, installation, and source-generation tooling.
- `tests/` owns automated tests.

## Rendering model

Public portfolio pages are built once and served as finished HTML. This is a
deliberate choice, not a limitation of the stack.

- **Build time (`npm run build`, runs once):** `scripts/prepare-pages.mjs`
  reads `static-source/` pages and renders the case study components in
  `components/case-studies/` (via `scripts/render-case-studies.mjs`), applies
  the shared shell and metadata, and writes the result to
  `lib/static-pages.json`.
- **Request time (every visitor):** `build/sites-worker.ts` looks up the route
  in `lib/static-pages.json` and returns the stored HTML before any React route
  runs. Small scripts in `public/assets/` add interactivity in the browser.

Why: portfolio content changes only when the site is deployed, so rendering it
once makes pages load faster, gives search engines finished HTML, and needs no
API. A client-rendered app that calls a server for data on every visit (for
example, Aura Logbook's React client with its .NET API) is the right choice
when data changes per user or per request, such as a signed-in user's journal
entries. Owner tools that do need live data (`/admin/`, the Dev Wiki) use the
React routes in `app/` and the storage APIs in `lib/`.

Files ending in `.mjs` are build-time Node scripts and tests, not server code.
`.mts` files are TypeScript without JSX that Node runs directly by stripping
types; `.tsx` files hold React components.

## Implementation sequence

1. Identify the user-facing screen and its feature boundary.
2. Define the data shape and state transitions before writing markup.
3. Compose existing primitives before creating a new component.
4. Extract a component when structure, semantics, behavior, or accessibility is reused.
5. Keep feature code declarative: data, labels, variants, intent, and handlers should be visible at the call site.
6. Keep server data, temporary UI state, and browser effects in their appropriate layers.
7. Validate semantics, keyboard behavior, responsive layout, lint, tests, and build output.
8. Commit the change using the repository's conventional commit policy.

## Component naming

Use names that describe user intent and responsibility. Prefer `PageHeader`,
`EmptyState`, `ImagePreview`, or `ProjectCard` over names that expose CSS or
layout mechanics. Shared components should expose typed props and own their
markup, visual states, semantics, and accessibility behavior.

## State guidance

- Derived values should remain derived rather than duplicated in state.
- Temporary form state belongs near the form or in a focused custom hook.
- Multi-step workflows should use a reducer when transitions become related.
- Effects are for synchronization with external systems, not ordinary rendering calculations.
- Add a state library only when cross-feature complexity justifies it.

## Review questions

- Does this belong in an existing layer?
- Is the component API expressing intent rather than implementation detail?
- Is markup or accessibility behavior duplicated?
- Can a future contributor find the data, state, and visual responsibilities quickly?
- Did the change preserve existing public routes, assets, and storage bindings?
