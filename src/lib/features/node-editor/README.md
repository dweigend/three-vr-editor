# `src/lib/features/node-editor`

This folder contains the optional node editor inside the editor workbench.

## Purpose

- provide a visual modulation layer without replacing the code editor
- stay optional and inert when hidden
- reuse the shared live layer instead of creating a second live-edit path
- stay inside the shared design system

## Current Shape

- `NodeEditorPanel.svelte`
  panel shell and workbench integration
- `node-editor-state.svelte.ts`
  local UI and layout state
- `node-editor-registry.ts`, `node-editor-mapper.ts`, `node-editor-modulation.ts`
  node definitions, mapping, and signal logic
- `render/`
  SvelteFlow-specific rendering

## Next Focus

- normalize modulation signals to `0..1`
- let target nodes map normalized input into concrete scene ranges
- add readable `Apply to Code` snippet generation for supported modules
- improve node and edge deletion affordances
- refactor and remove obsolete files once the modular signal model is stable

## Boundaries

- no separate route
- no Pi, auth, or provider dependencies
- no second preview source
- code remains the source of truth
- empty discovery results are valid and must render a calm empty state
