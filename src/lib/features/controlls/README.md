# `src/lib/features/controlls`

This folder contains the optional preview control panel inside the editor workbench.

## Purpose

- provide compact, example-style preview controls
- stay optional and inert when hidden
- reuse the shared live layer from `src/lib/features/editor`
- degrade cleanly for files without editable values

## Current Shape

- `ControlPanel.svelte`
  compact grouped controls
- `controlls-panel.ts`
  panel-specific shaping and grouping

## Boundaries

- no separate route
- no Pi, auth, or provider dependencies
- no second live-edit structure
- `selectedPath` stays the source for which file the panel reads
- accepted changes still flow back through the editor document update path

## Direction

- keep controls compact and parameter-focused
- move future control metadata into template-local helper files once template folders land
