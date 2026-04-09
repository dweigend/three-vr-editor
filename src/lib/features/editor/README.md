<!--
	Purpose: Document the editor-specific client layer under src/lib/features/editor.
	Context: The editor route now depends on one focused feature subtree instead of scattered client modules across src/lib.
	Responsibility: Explain what belongs in this layer and keep the boundary against primitives, blocks, and server services clear.
	Boundaries: This README is a directory guide, not a full API reference for every editor module.
-->

# `src/lib/features/editor`

This folder contains editor-specific client modules for the editor workspace.

## Main Areas

- CodeMirror UI integration
  `CodeEditor.svelte`, `FileSelect.svelte`, `editor-diagnostics.ts`
- preview runtime and error handling
  `ThreePreview.svelte`, `create-three-runtime.ts`, `load-three-preview-module.ts`, `three-viewer-errors.ts`
- workspace state and transport
  `three-editor-workspace-state.svelte.ts`, `editor-agent-client.ts`, `editor-agent-types.ts`
- template metadata and file creation UI
  `ThreeFileCreatePanel.svelte`, `ThreeTemplateParameterPanel.svelte`, `three-template-source.ts`, `three-template-types.ts`

## Boundaries

- Keep generic primitives in `src/lib/components`.
- Keep composed reusable UI in `src/lib/blocks`.
- Keep Pi SDK usage and filesystem access in `src/lib/server`.
