# `src/lib/features/node-editor`

This folder contains the optional node-editor module that lives inside the editor workbench.

## Purpose

- provide a visual editing surface on the same level as code, preview, and agent panels
- stay optional and isolated so the editor keeps working when the node editor is hidden
- reuse the shared UI system from `src/lib/components`, `src/lib/blocks`, and `src/app.css`
- connect to the existing editor workspace through explicit browser-side interfaces

## Planned Areas

- panel shell and workbench integration
  `NodeEditorPanel.svelte`
- browser-side state and layout
  `node-editor-state.svelte.ts`, `node-editor-layout.ts`
- type-safe interfaces and registry
  `node-editor-types.ts`, `node-editor-registry.ts`
- mapping between template parameters, graph state, and code updates
  `node-editor-mappers.ts`

## Current Status

- `NodeEditorPanel.svelte` is wired into the editor workbench as a placeholder panel.
- Window visibility now flows through the shared workbench toolbar state.
- The panel intentionally shows an empty state until graph editing lands.

## Boundaries

- Do not add a separate route for this feature.
- Do not depend on Pi, provider setup, or server-only modules.
- Keep node-editor-specific logic in this folder.
- Keep reusable primitives in `src/lib/components`.
- Keep reusable composed UI in `src/lib/blocks`.
- Keep styling in `src/app.css` instead of feature-local CSS files.
- Treat the code editor and workspace state as the source of truth.
