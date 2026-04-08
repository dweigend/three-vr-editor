<!--
	Purpose: Describe the thin Toolbar primitive family built on top of Bits UI.
	Context: Editor and future workbench chrome need an accessible one-line toolbar surface with roving focus.
	Responsibility: Define the public family boundary for toolbar roots and toolbar-native buttons.
	Boundaries: The family stays presentational and must not absorb editor or workspace business logic.
-->

# `toolbar`

Primitive UI family for accessible one-line toolbars.

## Public API

- Export public APIs only through `index.ts`.
- Keep internal implementation details inside `components/`.

## Boundaries

- May depend on `bits-ui` and `src/lib/utils`.
- Must not import from `src/lib/blocks`.
