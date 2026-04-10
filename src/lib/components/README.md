# `src/lib/components`

This folder contains primitive UI families derived from the Bits UI architecture.

Where Bits UI already provides a primitive, the local family should stay a thin wrapper around the official compound structure. Local code owns styling, small API adapters, and app-specific composition, but not accessibility, focus management, keyboard behavior, or state semantics that Bits UI already solves.

## Rules

- Every family lives in `src/lib/components/<family>`.
- Public imports go through the family `index.ts`, `exports.ts`, or the layer barrel.
- Prefer Bits UI as the source architecture. Keep official part names such as `Root`, `Trigger`, `Content`, `Portal`, `Overlay`, `Title`, `Description`, and `Close` when the primitive exists.
- Keep wrappers thin. Forward Bits UI props and types instead of rebuilding state machines, ARIA wiring, focus handling, or portal behavior locally.
- Support controlled and uncontrolled usage the same way as Bits UI, typically through `bind:` and `$bindable`.
- Primitives stay generic and never import from `src/lib/blocks`.
- Shared implementation helpers come from `src/lib/utils`.
- Family-owned presentation should live in a colocated `<family>.css` file imported by the family `index.ts`.
- Style through family classes, data attributes, and official component props instead of route-level global selectors.
- Add family docs only when they explain a real boundary, import rule, usage contract, or a deliberate deviation from Bits UI.
- If no Bits UI primitive exists, keep the same family discipline: explicit types, small public API, colocated styles, and no route-specific behavior.
- `src/app.css` is reserved for global foundations such as tokens, reset, shell layout, and a few true app-wide helpers.

## Reference Pattern

`dropdown-menu` is the reference family in this layer:

- `components/` mirrors the Bits UI compound parts such as `Root`, `Trigger`, `Content`, `Portal`, and `Item`.
- `types.ts` aliases Bits UI prop types and keeps the public surface explicit.
- `<family>.svelte.ts` holds tiny shared constants such as family class hooks.
- `index.ts` imports the family CSS once and re-exports the public surface.
- Local additions such as `Field` may compose the official parts, but should sit beside them instead of changing their contract.

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
