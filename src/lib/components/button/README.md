<!--
	Purpose: Describe the public button primitive family used across the app surfaces.
	Context: The family provides the shared action surface for route pages, blocks, and feature panels.
	Responsibility: Define the public boundary and keep implementation details private to the family.
	Boundaries: The family stays presentational and must not absorb routing or product-specific behavior.
-->

# `button`

Primitive UI family for shared action controls.

## Public API

- Export public APIs only through `index.ts`.
- Keep internal implementation details inside `components/`.

## Boundaries

- May depend on `src/lib/utils`.
- Must not import from `src/lib/blocks`.
