<!--
	Purpose: Document the composed UI block layer built from local primitives.
	Context: The repository uses this layer for reusable, domain-facing UI groups that sit above primitives.
	Responsibility: Explain which composed families belong here and keep the boundary against primitives and route-only code clear.
	Boundaries: This README covers the local block layer only, not primitives or feature-specific implementation details outside it.
-->

# `src/lib/blocks`

This folder contains composed UI families built from local primitives.

## Rules

- Every family lives in `src/lib/blocks/<family>`.
- Public imports go through the family `index.ts` or the layer barrel.
- Blocks may import primitives from `src/lib/components` and shared helpers from `src/lib/utils`.
- Route-only business logic stays outside the block layer.

## Current Families

- `conversation-panel`
- `input-bar`
- `settings-section`
