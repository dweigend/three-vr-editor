# `src/lib/server/editor`

This folder contains the server-side services behind the editor workbench.

## Main Areas

- managed file access
  `files.ts`, `paths.ts`
- preview building
  `preview-build.ts`, `preview-errors.ts`, `preview-source-map.ts`
- workspace bootstrap
  `editor-workspace-load.ts`
- template discovery
  `templates.ts`

## Responsibilities

- guard managed paths under `static/three`
- list, read, save, create, and later migrate managed workspace content
- build browser-runnable preview bundles
- expose editor bootstrap data
- discover valid starter templates from `static/templates`

## Current Workspace Model

- `static/templates`
  committed starter material
- `static/three`
  local managed workspace
- `static/three/scenes`
  generated editable scene files

## Next Direction

- migrate template discovery and workspace bootstrap toward self-contained template folders
- keep route handlers thin and centralize that migration in this folder

## Boundaries

- client runtime and UI do not belong here
- Pi logic does not belong here
