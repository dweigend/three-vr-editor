# `src/lib/server/editor`

This folder contains the server-side services behind the editor workspace.

## Main Areas

- managed file access
  `files.ts`, `paths.ts`
- preview building
  `preview-build.ts`, `preview-errors.ts`, `preview-source-map.ts`
- editor workspace bootstrap loading
  `editor-workspace-load.ts`
- template discovery
  `templates.ts`

## Responsibilities

- guard managed file paths under `static/three`
- list, read, save, and create managed scene files
- build browser-runnable preview bundles with `esbuild`
- expose the initial page bootstrap data for the editor route
- list valid templates by parsing helper-based metadata exports or legacy template
  headers under `static/templates`

## Workspace Conventions

- `static/three/`
  Ignored local editor workspace. The page loader bootstraps `scenes/cube.ts` here when the workspace starts empty.
- `static/templates/`
  Shared starter sources that can be copied into the editable workspace.
- `static/three/scenes/`
  Generated editable scene files created by the editor.

The file service keeps path access constrained to the managed root and treats template metadata as optional. Starter material that should be committed belongs in `static/templates`, not in `static/three`.

## Boundaries

- Client-side runtime, preview mounting, and editor UI do not belong here.
- Route handlers should remain thin and delegate file and preview behavior to this folder.
- Pi logic does not belong here.
