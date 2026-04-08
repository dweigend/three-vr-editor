<!--
	Purpose: Describe the shared command-input primitive copied from the ui-system reference.
	Context: Minimal command-line style surfaces need a reusable single-line input primitive instead of route-local markup.
	Responsibility: Define the public family boundary for terse command and prompt inputs.
	Boundaries: The family stays presentational and must not absorb submit or domain logic.
-->

# `command-input`

Primitive UI family for command-line style single-line input.

## Public API

- Export public APIs only through `index.ts`.
- Keep internal implementation details inside `components/`.

## Boundaries

- May depend on `src/lib/utils`.
- Must not import from `src/lib/blocks`.
