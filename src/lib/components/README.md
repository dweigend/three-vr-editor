<!--
	Purpose: Document the primitive UI layer aligned with the local ui-system structure.
	Context: The repository uses this layer as the long-term home for reusable visual primitives.
	Responsibility: Describe the family structure, import boundaries, and current primitive families.
	Boundaries: This README covers the local primitive layer only, not app-specific blocks or route composition.
-->

# `src/lib/components`

This folder contains ui-system-aligned primitive UI families.

## Rules

- Every family lives in `src/lib/components/<family>`.
- Public imports go through the family `index.ts` or the layer barrel.
- Primitives stay generic and never import from `src/lib/blocks`.
- Shared implementation helpers come from `src/lib/utils`.
- Family roots and `components/` folders keep their own `README.md` files.

## Current Families

- `button`
- `card`
- `command-input`
- `dropdown-menu`
- `icon-button`
- `scroll-area`
- `table`
- `text-input`
- `textarea`
- `toolbar`
