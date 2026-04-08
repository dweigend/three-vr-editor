<!--
	Purpose: Document the server-side Three workflow services that power managed files, previews, and template discovery.
	Context: The editor and template workbench demos depend on a small set of server-only helpers instead of route-local ad hoc logic.
	Responsibility: Explain the file service, preview builder, demo loaders, template service, and static/three conventions.
	Boundaries: This README does not describe client-side Three runtime or editor UI behavior in detail.
-->

# `src/lib/server/three`

This folder contains the server-side services behind the Three viewer, editor, and template workbench demos.

## Main Areas

- managed file access
  `files.ts`, `paths.ts`
- preview building
  `preview-build.ts`, `preview-errors.ts`, `preview-source-map.ts`
- demo bootstrap loaders
  `editor-page-load.ts`, `editor-template-page-load.ts`
- template discovery
  `templates.ts`

## Responsibilities

- guard managed file paths under `static/three`
- list, read, save, and create managed scene files
- build browser-runnable preview bundles with `esbuild`
- expose initial page bootstrap data for editor-style routes
- list valid templates by parsing optional template headers

## `static/three` Conventions

- `static/three/cube.ts`
  Stable minimal reference scene for the viewer path.
- `static/three/templates/`
  Managed template sources for the template workbench.
- `static/three/scenes/`
  Generated editable scene files created by the workbench.

The file service should keep path access constrained to the managed root and treat template metadata as optional. Missing headers must not make a scene invalid.

## Boundaries

- Client-side runtime, preview mounting, and editor UI do not belong here.
- Route handlers should remain thin and delegate file and preview behavior to this folder.
- Pi logic does not belong here.

See [`../../three/README.md`](../../three/README.md) for the client-side runtime and workbench modules, and the root [`README.md`](../../../../README.md) for the end-to-end demo map.
