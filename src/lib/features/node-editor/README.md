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
  `node-editor-state.svelte.ts`
- type-safe interfaces and registry
  `node-editor-types.ts`, `node-editor-registry.ts`
- mapping between template parameters, graph state, and code updates
  `node-editor-mapper.ts`
- SvelteFlow render shell
  `render/NodeEditorCanvas.svelte`, `render/NodeEditorCanvasTargetNode.svelte`
- target node rendering
  `NodeEditorTargetNode.svelte`

## Current Status

- `NodeEditorPanel.svelte` renders parameter-driven target nodes from the shared live layer on top of a direct SvelteFlow canvas.
- `node-editor-state.svelte.ts` keeps only local UI state such as filter, selection, per-file layout, and viewport.
- `node-editor-registry.ts` and `node-editor-mapper.ts` translate editable template parameters into stable target-node and canvas view models.
- Direct `@xyflow/svelte` imports are isolated to the `render/` folder.
- Window visibility now flows through the shared workbench toolbar state.
- Empty-state handling stays graceful for missing template metadata, missing parameter blocks, and files without editable values.

## Boundaries

- Do not add a separate route for this feature.
- Do not depend on Pi, provider setup, or server-only modules.
- Keep node-editor-specific logic in this folder.
- Keep reusable primitives in `src/lib/components`.
- Keep reusable composed UI in `src/lib/blocks`.
- Keep styling in `src/app.css` instead of feature-local CSS files.
- Treat the code editor and workspace state as the source of truth.
- Keep the shared live layer in `src/lib/features/editor` as the only live data source.
- Keep the SvelteFlow coupling inside the render shell instead of spreading it into editor-wide state modules.
