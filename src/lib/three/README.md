<!--
	Purpose: Document the client-side Three integration layer that powers the viewer, editor, and template workbench demos.
	Context: This folder contains the reusable client-side Three integration that sits underneath the editor page.
	Responsibility: Explain the main modules, shared contracts, and the boundaries between runtime, editor state, and template metadata logic.
	Boundaries: This README does not replace the source-level comments in individual scene or runtime modules.
-->

# `src/lib/three`

This folder contains the client-side Three.js integration used by the demo routes.

## Main Areas

- viewer modules
  `ThreeViewer.svelte`, `create-three-viewer.ts`, `ThreeViewerHeader.svelte`, `ThreeViewerErrorPanel.svelte`
- preview and runtime modules
  `ThreePreview.svelte`, `create-three-runtime.ts`, `load-three-preview-module.ts`
- editor workspace modules
  `three-editor-workspace-state.svelte.ts`, `three-editor-types.ts`, `three-editor-workspace-types.ts`
- template workbench modules
  `ThreeTemplateParameterPanel.svelte`, `ThreeFileCreatePanel.svelte`, `three-template-types.ts`, `three-template-source.ts`
- shared scene and error contracts
  `three-demo-scene.ts`, `three-viewer-errors.ts`, `preview-runtime-errors.ts`

## Core Contracts

- Managed scene files export `createDemoScene`.
- Scene files may optionally export `demoRendererKind = 'webgl' | 'webgpu'`.
- Scene controllers may optionally provide custom `render()` or `resize()` hooks.
- Template files may optionally contain:
  - an `@three-template` header
  - a managed `templateParameters` block

The optional metadata powers the dynamic parameter panel. If the metadata is missing, the file should still behave like a normal managed scene.

## Screen Composition

- The framed app shell and right-side menu live in `src/routes/+layout.svelte` and `src/app.css`.
- The main editor page composition now lives in `src/routes/editor/+page.svelte`.
- This folder provides the reusable building blocks below that page: preview rendering, editor state, template metadata, and runtime helpers.

## Responsibilities

- mount and dispose Three runtimes safely
- swap preview modules from server-built code
- keep viewer, preview, and editor state modular
- expose shared types that are safe for client and server reuse

## Boundaries

- Server-side file access and preview bundling do not belong here.
- Route-specific headings and page composition do not belong here.
- Pi SDK logic does not belong here.

See [`../server/three/README.md`](../server/three/README.md) for the managed-file and preview-build side of the workflow, and the root [`README.md`](../../README.md) for the demo progression overview.
