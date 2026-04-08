<!--
	Purpose: Document the composed UI block layer introduced for incremental ui-system alignment.
	Context: The repository is adding a small reusable block surface without migrating existing Three and Pi modules.
	Responsibility: Explain which composed families belong here and keep the boundary against primitives and route-only code clear.
	Boundaries: This README covers the local block layer only, not primitives or feature-specific implementation details outside it.
-->

# `src/lib/blocks`

This folder contains composed UI families built from local primitives.

## Rules

- Every family lives in `src/lib/blocks/<family>`.
- Public imports should go through the family `index.ts` or the layer barrel.
- Blocks may import primitives from `src/lib/components` and shared helpers from `src/lib/utils`.
- Route-only business logic should stay outside the block layer.

## Current Families

- `app-launcher`
- `conversation-panel`
- `input-bar`
- `settings-section`
