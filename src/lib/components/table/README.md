<!--
	Purpose: Describe the semantic table primitive family used for compact data-heavy layouts.
	Context: Settings and future admin-style surfaces need a reusable, native table abstraction instead of repeated route-local markup.
	Responsibility: Define the public table family boundary and keep implementation details private to the family.
	Boundaries: The family stays presentational and must not absorb sorting, filtering, pagination, or domain logic.
-->

# `table`

Primitive UI family for compact semantic tables.

## Public API

- Export public APIs only through `index.ts`.
- Keep implementation details inside `components/`.

## Boundaries

- May depend on `src/lib/utils`.
- Must not import from `src/lib/blocks`.
