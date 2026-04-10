# `src/lib/features/editor`

This folder contains the editor workbench client modules.

## Main Areas

- CodeMirror integration
  `CodeEditor.svelte`, `editor-diagnostics.ts`
- preview runtime
  `ThreePreview.svelte`, `create-three-runtime.ts`, `load-three-preview-module.ts`
- workspace state
  `three-editor-workspace-state.svelte.ts`, `editor-workbench.ts`
- shared live layer
  `editor-live-layer-types.ts`, `editor-live-layer-discovery.ts`,
  `editor-live-layer-commit.ts`, `editor-live-layer.svelte.ts`
- template helpers and parsing
  `three-helpers.ts`, `three-template-source.ts`, `three-template-types.ts`

## Invariants

- `selectedPath` is the shared source for code, controls, and preview.
- Code stays the source of truth.
- The shared live layer is optional and only exists to support interactive editor modules.
- Template metadata is optional and must degrade to empty states cleanly.
- Shared browser state should stay in `.svelte.ts` modules with stable exported objects.

## Boundaries

- Keep generic UI in `src/lib/components` and `src/lib/blocks`.
- Keep Pi usage and filesystem access out of this folder.
- Keep route components thin and move workbench logic into feature modules.
