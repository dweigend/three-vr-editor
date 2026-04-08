<!--
	Purpose: Provide the central project documentation for the Three.js VR builder repository.
	Context: Contributors need one project-specific entrypoint that explains the demos, architecture, workflows, and important boundaries.
	Responsibility: Summarize the repository purpose, module layout, demo progression, validation commands, and contribution guidance.
	Boundaries: This README is an overview, not a full API reference or a replacement for folder-local READMEs.
-->

# three-js-vr-builder

`three-js-vr-builder` is a SvelteKit playground for building and iterating on a Three.js editor workflow inside the app itself.

The current app is intentionally centered on three user-facing surfaces:

- an editor workspace with live Three.js preview plus Pi one-shot and session modes
- a Pi chat surface with its own persistent session scope
- a consolidated settings page for OpenRouter keys and model selection

## Current Capabilities

- Managed Three source files live under `static/three`.
- The editor path can load, edit, save, and preview managed Three scene files.
- The editor Pi panel can analyze or update the active editor file through server-only Pi tooling in either one-shot or editor-session mode.
- The settings path can validate, store, activate, and remove multiple OpenRouter keys.
- The settings path can also select the configured OpenRouter model.
- Chat and editor always share the same configured OpenRouter key and model, but they never share session state.
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
- `/three/editor/pi`
- `/pi/chat`
- `/pi`

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

Contains the three main app entrypoints plus the supporting editor endpoints under `src/routes/three/editor`.

### `src/lib/editor`

Holds thin CodeMirror-oriented UI primitives:

- `CodeEditor.svelte` mounts and manages the editor surface
- `editor-diagnostics.ts` owns diagnostic and changed-line decorations
- `FileSelect.svelte` keeps file selection UI simple and reusable

This layer should stay UI-focused and not absorb preview orchestration or filesystem access.

### `src/lib/three`

Contains the main client-side Three integration:

- editor workspace components
- shared runtime and preview loader modules
- shared scene and workspace types

Important contract:

- managed scene modules export `createDemoScene`
- scene modules may optionally export `demoRendererKind = 'webgl' | 'webgpu'`

### `src/lib/pi`

Contains browser-side Pi UI and transport-only types. This layer must stay free of Pi SDK imports and act as a thin client over server endpoints.

- The standalone chat UI uses a persistent chat-scoped session.
- The editor UI supports `one-shot` and `session` modes on the same endpoint contract.

### `src/lib/server/pi`

Contains server-only Pi integration:

- auth and model configuration
- shared scoped session bootstrapping
- resource loading
- specialized active-file edit tooling

The chat and editor routes share one backend session/runtime core, but they run in separate scopes:

- `chat` sessions persist under the chat session directory
- `editor` session mode persists under the editor session directory
- editor `one-shot` uses in-memory sessions only

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
- `templates/` contains managed template sources used by the file services
- generated editable files belong under `scenes/` when created through the editor workflow

The folder is intentionally treated as application-managed input, not as a general asset dump.

## App Surfaces

The app intentionally exposes only three primary screens:

1. `/`
   Minimal launcher for the editor, chat, and settings surfaces.
2. `/three/editor/pi`
   The main Three.js editor workspace with preview plus Pi `one-shot` and `session` modes.
3. `/pi/chat`
   A chat-scoped persistent Pi chat screen that uses the configured key and model.
4. `/pi`
   Consolidated settings for OpenRouter keys and model selection.

## Contribution Notes

- Prefer additive changes inside the three main surfaces over reintroducing separate demo entrypoints.
- Keep Pi imports in server-only modules, route handlers, and `.server.ts` files.
- Keep editor modules UI-focused; put file or preview orchestration in shared workspace state or server services.
- Reuse the shared `createDemoScene` contract instead of inventing route-specific scene APIs.
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
