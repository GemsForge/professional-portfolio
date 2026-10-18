# Aura Logbook dependency catalog

The source of truth for the Aura Logbook technology badges is
[`scripts/auralogbook-dependencies.mts`](../scripts/auralogbook-dependencies.mts).
It contains the typed dependency definitions, the two rendered groups, and the
HTML renderer used by the page-preparation step.

## Why this is TypeScript

The catalog uses interfaces and discriminated logo variants so the compiler
checks every definition. The build script remains a plain Node `.mjs` file and
imports the `.mts` module directly. The repository requires Node 22.13 or
newer; Node's built-in type stripping runs this module without adding a JSX or
runtime transpiler dependency.

## Adding a dependency

1. Add its ID to `DependencyId`.
2. Add a typed entry to `AURALOGBOOK_DEPENDENCIES`.
3. Use `FILE` for an image in `public/assets/auralogbook-stack/`, `SPRITE` for
   a symbol in the architecture SVG, or `GLYPH` for a text mark.
4. Add the ID to the appropriate group in `AURALOGBOOK_DEPENDENCY_GROUPS`.
5. Run `npx tsc --noEmit`, `npm run build`, and `npm run test:portfolio`.

Keep technical IDs stable and only include tools that belong to the relevant
project. `declared-not-wired` is reserved for packages present in the source
but not currently connected to the application's implementation.
