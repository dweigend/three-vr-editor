<!--
	Purpose: Describe the scroll-area primitive family used for compact scrollable regions.
	Context: Dense settings and workbench surfaces need reusable internal scrolling without route-local overflow wrappers.
	Responsibility: Define the public family boundary for a styled Bits UI scroll area wrapper.
	Boundaries: This family stays presentational and must not absorb panel, table, or layout-specific business logic.
-->

# `scroll-area`

Primitive UI family for reusable scrollable regions.

## Public API

- Export public APIs only through `index.ts`.
- Keep implementation details inside `components/`.

## Boundaries

- May depend on `bits-ui` and `src/lib/utils`.
- Must not import from `src/lib/blocks`.
