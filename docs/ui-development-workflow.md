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
- `static-source/` owns editable source pages and brand assets used by the site generator.
- `scripts/` owns build, installation, and source-generation tooling.
- `tests/` owns automated tests.

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
