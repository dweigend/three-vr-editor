# `src/lib/blocks`

This folder contains composed UI families built from local primitives.

## Rules

- Every family lives in `src/lib/blocks/<family>`.
- Public imports go through the family `index.ts` or the layer barrel.
- Blocks may import primitives from `src/lib/components` and shared helpers from `src/lib/utils`.
- Route-only business logic stays outside the block layer.
- Block-owned presentation should live in a colocated `<family>.css` file imported by the family `index.ts`.
- Blocks may style their own internal composition of primitives, but route-specific density or workflow tweaks should stay with the owning feature or route.

## Current Families

- `conversation-panel`
- `input-bar`
- `settings-section`
