# `src/lib/features/editor`

This folder contains editor-specific client modules for the editor workspace.

## Main Areas

- CodeMirror UI integration
  `CodeEditor.svelte`, `FileSelect.svelte`, `editor-diagnostics.ts`
- preview runtime and error handling
  `ThreePreview.svelte`, `create-three-runtime.ts`, `load-three-preview-module.ts`, `three-viewer-errors.ts`
- workspace state and transport
  `three-editor-workspace-state.svelte.ts`, `editor-agent-client.ts`, `editor-agent-types.ts`
- optional shared live-parameter layer for interactive editor modules
  `LIVE-LAYER-PLAN.md`, `editor-live-layer-types.ts`,
  `editor-live-layer-discovery.ts`, `editor-live-layer.svelte.ts`
- template metadata and file creation UI
  `ThreeFileCreatePanel.svelte`, `ThreeTemplateParameterPanel.svelte`,
  `three-helpers.ts`, `three-template-source.ts`, `three-template-types.ts`

## Public Template API

Managed template files should import from `three-helpers.ts` instead of reaching into
multiple editor modules directly.

- scene contract types
  `ThreeDemoSceneFactory`, `ThreeDemoSceneController`
- template metadata helpers
  `defineThreeTemplateUi(...)`, `defineThreeTemplateParameters(...)`
- shared input helper
  `createThreePointerTracker(...)`

## Boundaries

- Keep generic primitives in `src/lib/components`.
- Keep composed reusable UI in `src/lib/blocks`.
- Keep Pi SDK usage and filesystem access in `src/lib/server`.
- Keep optional shared live preview state in this folder rather than duplicating it in feature modules.
- The shared live layer is foundation-only for now and stays inert until an interactive
  module explicitly activates it.
