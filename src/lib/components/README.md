<!--
	Purpose: Document the primitive UI layer introduced for incremental ui-system alignment.
	Context: This brownfield repository is adopting a small reusable component layer without migrating existing domain modules.
	Responsibility: Describe the family structure, import boundaries, and current primitive families.
	Boundaries: This README covers the local primitive layer only, not app-specific blocks or route composition.
-->

# `src/lib/components`

This folder contains ui-system-aligned primitive UI families.

## Rules

- Every family lives in `src/lib/components/<family>`.
- Public imports should go through the family `index.ts` or the layer barrel.
- Primitives must stay generic and must not import from `src/lib/blocks`.
- Shared implementation helpers should come from `src/lib/utils`.

## Current Families

- `button`
- `card`
- `command-input`
- `dropdown-menu`
- `icon-button`
- `scroll-area`
- `table`
- `textarea`
- `toolbar`
