<!--
	Purpose: Describe the shared multiline input primitive copied from the ui-system reference.
	Context: Reusable input bars and editor prompts need a local textarea family instead of route-specific raw markup.
	Responsibility: Define the public family boundary for textarea rendering and styling reuse.
	Boundaries: The family stays presentational and must not absorb domain behavior or block composition.
-->

# `textarea`

Primitive UI family for shared multiline text entry.

## Public API

- Export public APIs only through `index.ts`.
- Keep internal implementation details inside `components/`.

## Boundaries

- May depend on `src/lib/utils`.
- Must not import from `src/lib/blocks`.
