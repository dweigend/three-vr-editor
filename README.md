<!--
	Purpose: Provide the central project documentation for the Three.js VR builder repository.
	Context: Contributors need one project-specific entrypoint that explains the demos, architecture, workflows, and important boundaries.
	Responsibility: Summarize the repository purpose, module layout, demo progression, validation commands, and contribution guidance.
	Boundaries: This README is an overview, not a full API reference or a replacement for folder-local READMEs.
-->

# three-js-vr-builder

`three-js-vr-builder` is a SvelteKit playground for building and iterating on Three.js editing workflows inside the app itself.

The repository currently focuses on four connected areas:

- a minimal viewer demo for a managed Three scene
- a reusable CodeMirror-based Three editor with live preview
- a Pi-assisted editor variant with server-only agent integration
- a template workbench with optional source headers, dynamic parameter controls, and WebGL/WebGPU-aware previews

## Current Capabilities

- Managed Three source files live under `static/three`.
- The viewer path can render the stable default scene from `static/three/cube.ts`.
- The editor path can load, edit, save, and preview managed Three scene files.
- The Pi path can analyze or update the active editor file through server-only Pi tooling.
- The template workbench can create new files from blank starters or managed templates under `static/three/templates`.
- Template scenes can optionally expose a machine-readable header and `templateParameters` block for the dynamic parameter panel.
- The runtime supports both `WebGLRenderer` and `WebGPURenderer` through the shared `createDemoScene` contract.

## Quick Start

Install dependencies:

```sh
bun install
```

Run the development server:

```sh
bun run dev
```

Open the main demo index:

- `/`
- `/editor`
- `/three`
- `/three/editor`
- `/three/editor/pi`
- `/three/editor/templates`

## Validation

Run the most important checks before finishing a change:

```sh
bun run check
bunx biome check .
bun run test:unit -- --run
```

Additional commands:

```sh
bun run build
bun run test
```

## Architecture Map

### `src/routes`

Contains the route entrypoints that expose the repository milestones. The Three demos intentionally stay additive so earlier steps remain available while newer workbench layers build on top.

### `src/lib/editor`

Holds thin CodeMirror-oriented UI primitives:

- `CodeEditor.svelte` mounts and manages the editor surface
- `editor-diagnostics.ts` owns diagnostic and changed-line decorations
- `FileSelect.svelte` keeps file selection UI simple and reusable

This layer should stay UI-focused and not absorb preview orchestration or filesystem access.

### `src/lib/three`

Contains the main client-side Three integration:

- viewer components
- editor workspace components
- template workbench components
- shared runtime and preview loader modules
- shared scene, template, and workspace types

Important contract:

- managed scene modules export `createDemoScene`
- scene modules may optionally export `demoRendererKind = 'webgl' | 'webgpu'`
- template metadata is optional and should never be required for rendering

### `src/lib/pi`

Contains browser-side Pi UI and transport-only types. This layer must stay free of Pi SDK imports and act as a thin client over server endpoints.

### `src/lib/server/pi`

Contains server-only Pi integration:

- auth and model configuration
- session bootstrapping
- resource loading
- specialized active-file edit tooling

All Pi SDK usage belongs here or in route handlers, never in browser components.

### `src/lib/server/three`

Contains server-side Three workflow services:

- managed file access under `static/three`
- preview bundling with `esbuild`
- demo bootstrap loaders
- managed template listing

This layer defines the rules for editable files, preview safety, and template discovery.

### `static/three`

This is the managed source root for scene files and scene templates.

- `cube.ts` is the stable minimal reference scene
- `templates/` contains managed template sources for the workbench
- generated editable files belong under `scenes/` when created through the workbench

The folder is intentionally treated as application-managed input, not as a general asset dump.

## Demo Map

The Three demos represent a progression rather than replacements:

1. `/three`
   Minimal viewer smoke test using the default managed scene.
2. `/three/editor`
   Plain editor and preview workspace without agent tooling.
3. `/three/editor/pi`
   Editor workspace plus Pi-assisted active-file workflow.
4. `/three/editor/templates`
   Template workbench with file creation, optional parameter headers, and WebGL/WebGPU-aware preview behavior.

This additive structure is intentional. New work should prefer adding the next milestone instead of replacing an earlier demo.

## Template Workbench

The template workbench is designed to stay opportunistic and failure-tolerant.

- A scene file may include an optional `@three-template` header comment.
- A scene file may include an optional managed `templateParameters` block.
- If the workbench finds that metadata, it renders matching controls.
- If the metadata is missing, the file still behaves like a normal managed scene and no parameter UI is shown.

Supported control shapes currently include:

- `text`
- `color`
- `range`
- `select`

Templates are curated, app-compatible adaptations of official Three.js example ideas rather than full HTML-demo copies.

## Contribution Notes

- Prefer additive changes over replacing existing demos or workflows.
- Keep Pi imports in server-only modules, route handlers, and `.server.ts` files.
- Keep editor modules UI-focused; put file or preview orchestration in shared workspace state or server services.
- Reuse the shared `createDemoScene` contract instead of inventing route-specific scene APIs.
- Treat template metadata as optional enhancement only.
- Keep documentation current when folder responsibilities shift. Important architecture folders under `src/lib` and `src/lib/server` should have short local READMEs.

## Folder Guides

For more focused documentation, see:

- [`src/lib/README.md`](./src/lib/README.md)
- [`src/lib/editor/README.md`](./src/lib/editor/README.md)
- [`src/lib/three/README.md`](./src/lib/three/README.md)
- [`src/lib/pi/README.md`](./src/lib/pi/README.md)
- [`src/lib/server/README.md`](./src/lib/server/README.md)
- [`src/lib/server/pi/README.md`](./src/lib/server/pi/README.md)
- [`src/lib/server/three/README.md`](./src/lib/server/three/README.md)
