# `src/lib/features/controlls`

This folder contains the optional control-panel module that lives inside the editor workbench.

## Purpose

- provide a lightweight preview control panel inspired by Three.js example controls
- stay optional and isolated so the editor keeps working when the control panel is hidden
- reuse the shared UI system from `src/lib/components`, `src/lib/blocks`, and `src/app.css`
- share the same temporary parameter-access layer as the node editor instead of introducing a second live-edit path

## Planned Areas

- panel shell and workbench integration
  `ControlPanel.svelte`
- browser-side panel state
  `controlls-state.svelte.ts`
- dynamic variable discovery and grouping
  `controlls-discovery.ts`, `controlls-groups.ts`
- adapters to the shared live parameter layer
  `controlls-bridge.ts`

## Current Status

- `ControlPanel.svelte` is wired into the editor workbench as a placeholder panel.
- Window visibility now flows through the shared workbench toolbar state.
- The panel intentionally shows an empty state until parameter controls land.

## Boundaries

- Do not add a separate route for this feature.
- Do not depend on Pi, provider setup, or server-only modules.
- Do not create a dedicated live-edit structure when the shared layer can be reused.
- Keep control-panel-specific logic in this folder.
- Keep reusable primitives in `src/lib/components`.
- Keep reusable composed UI in `src/lib/blocks`.
- Keep styling in `src/app.css` instead of feature-local CSS files.
- Treat the code editor and workspace state as the source of truth.
