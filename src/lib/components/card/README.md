<!--
	Purpose: Describe the shared card primitive family used for grouped navigation and panel content.
	Context: The repository is adding a minimal reusable surface layer before attempting broader UI-system adoption.
	Responsibility: Define the card family's public API and keep internal pieces private to the family.
	Boundaries: The family stays generic and should not absorb app-specific data or route logic.
-->

# `card`

Primitive UI family for shared surface containers.

## Public API

- Export public APIs only through `index.ts`.
- Keep implementation details inside `components/`.

## Boundaries

- May depend on `src/lib/utils`.
- Must not import from `src/lib/blocks`.
