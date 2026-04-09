<!--
	Purpose: Document the server-side Three workflow services that power managed files, previews, and template discovery.
	Context: The editor workspace depends on a small set of server-only helpers instead of route-local ad hoc logic.
	Responsibility: Explain the file service, preview builder, editor page loader, template service, and the split between editable scenes and template sources.
	Boundaries: This README does not describe client-side Three runtime or editor UI behavior in detail.
-->

# `src/lib/server/three`

This folder contains the server-side services behind the Three viewer, editor, and template workbench demos.

## Main Areas

- managed file access
  `files.ts`, `paths.ts`
- preview building
  `preview-build.ts`, `preview-errors.ts`, `preview-source-map.ts`
- editor workspace bootstrap loader
  `editor-workspace-load.ts`
- template discovery
  `templates.ts`

## Responsibilities

- guard managed file paths under `static/three`
- list, read, save, and create managed scene files
- build browser-runnable preview bundles with `esbuild`
- expose the initial page bootstrap data for the editor route
- list valid templates by parsing optional template headers under `static/templates`

## `static/three` Conventions

- `static/three/`
  Ignored local editor workspace. The page loader bootstraps `scenes/cube.ts` here when the workspace starts empty.
- `static/templates/`
  Shared template sources that can be copied into the editable workbench.
- `static/three/scenes/`
  Generated editable scene files created by the workbench.

The file service should keep path access constrained to the managed root and treat template metadata as optional. Missing headers must not make a scene invalid.
Starter material that should be committed belongs in `static/templates`, not in `static/three`.

## Boundaries

- Client-side runtime, preview mounting, and editor UI do not belong here.
- Route handlers should remain thin and delegate file and preview behavior to this folder.
- Pi logic does not belong here.

See [`../../three/README.md`](../../three/README.md) for the client-side runtime and workbench modules, and the root [`README.md`](../../../../README.md) for the end-to-end demo map.
