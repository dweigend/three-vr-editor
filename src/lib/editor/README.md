<!--
	Purpose: Document the responsibilities and boundaries of the editor-specific library modules.
	Context: The Three editor demos depend on a small set of reusable CodeMirror wrappers and diagnostic helpers.
	Responsibility: Explain what the editor folder owns and what should stay in workspace or server layers instead.
	Boundaries: This README does not document route-level behavior or server-side file services.
-->

# `src/lib/editor`

This folder contains the thin, reusable editor UI primitives used by the Three editing demos.

## Main Modules

- `CodeEditor.svelte`
  Mounts the CodeMirror surface, applies diagnostics, and exposes save/redo callbacks.
- `editor-diagnostics.ts`
  Owns `StateField`/`StateEffect`-driven diagnostic and changed-line decorations.
- `FileSelect.svelte`
  Keeps file selection UI reusable and independent of route logic.

## Responsibilities

- editor rendering
- editor-local interaction wiring
- visual diagnostics and changed-line markers
- simple file selection controls

## Boundaries

- Do not add filesystem access here.
- Do not build preview requests or manage route-level orchestration here.
- Do not move Pi or managed file-service logic into this folder.

Editor workflow orchestration belongs in the shared Three workspace modules under [`../three`](../three/README.md).
