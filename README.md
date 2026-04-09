<!--
	Purpose: Provide the central project documentation for the Three.js VR builder repository.
	Context: Contributors need one project-specific entrypoint that explains the app surfaces, architecture, workflows, and important boundaries.
	Responsibility: Summarize the repository purpose, module layout, validation commands, and contribution guidance.
	Boundaries: This README is an overview, not a full API reference or a replacement for folder-local READMEs.
-->

# three-js-vr-builder

`three-js-vr-builder` is a SvelteKit playground for building and iterating on a Three.js editor workflow inside the app itself.

The current app is intentionally centered on three user-facing surfaces:

- an editor workspace with live Three.js preview plus Pi one-shot and session modes
- a Pi chat surface with its own persistent session scope
- a consolidated settings page for OpenRouter keys and model selection

## Current Capabilities

- Managed editable Three source files live under `static/three`.
- `static/three` is treated as a local generated workspace and ignored by git except for the placeholder directory entry.
- Starter templates live under `static/templates`.
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

Open the main app surfaces:

- `/editor`
- `/chat`
- `/settings`

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

Contains the three main app pages plus the supporting child endpoints under `src/routes/editor` and `src/routes/chat`.

### `src/lib/components`

Holds reusable primitive UI families aligned with the local `ui-system` structure.

### `src/lib/blocks`

Holds composed UI families built from local primitives.

### `src/lib/features/editor`

Contains editor-specific client modules:

- `CodeEditor.svelte` mounts and manages the CodeMirror surface
- `FileSelect.svelte` keeps file selection UI small and reusable
- `ThreePreview.svelte` mounts the preview runtime
- workspace state, template parsing, and editor-agent transport stay nearby

Important contract:

- managed scene modules export `createDemoScene`
- scene modules may optionally export `demoRendererKind = 'webgl' | 'webgpu'`

### `src/lib/features/chat`

Contains browser-side chat transport and conversation state. This layer stays free of Pi SDK imports and acts as a thin client over server endpoints.

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

### `src/lib/server/editor`

Contains server-side editor workflow services:

- managed file access under `static/three`
- preview bundling with `esbuild`
- workspace bootstrap loaders
- managed template listing

This layer defines the rules for editable files, preview safety, and template discovery.

### `static/three`

This is the managed source root for editable scene files.

- the editor bootstraps `scenes/cube.ts` locally when the workspace is empty
- generated editable files belong under `scenes/` when created through the editor workflow

The folder is intentionally treated as local application-managed input, not as a committed asset dump.

### `static/templates`

This folder contains the teaching-oriented starter templates used by the editor workflow.

- each template stays self-contained and readable for students
- template metadata powers the workbench template picker
- non-template helper files such as documentation are ignored unless they include a template header

## App Surfaces

The app intentionally exposes only three primary screens:

1. `/editor`
   The main Three.js editor workspace with preview plus Pi `one-shot` and `session` modes.
2. `/chat`
   A chat-scoped persistent Pi chat screen that uses the configured key and model.
3. `/settings`
   Consolidated settings for OpenRouter keys and model selection.

## Contribution Notes

- Prefer changes inside the three main surfaces over reintroducing separate route stacks.
- Keep Pi imports in server-only modules, route handlers, and `.server.ts` files.
- Keep editor modules UI-focused; put file or preview orchestration in shared workspace state or server services.
- Reuse the shared `createDemoScene` contract instead of inventing route-specific scene APIs.
- Commit starter scenes and teaching material under `static/templates`; keep local editor output under ignored `static/three`.
- Keep documentation current when folder responsibilities shift. Important architecture folders under `src/lib` and `src/lib/server` should have short local READMEs.

## Folder Guides

For more focused documentation, see:

- [`src/lib/README.md`](./src/lib/README.md)
- [`src/lib/features/editor/README.md`](./src/lib/features/editor/README.md)
- [`src/lib/features/chat/README.md`](./src/lib/features/chat/README.md)
- [`src/lib/server/README.md`](./src/lib/server/README.md)
- [`src/lib/server/pi/README.md`](./src/lib/server/pi/README.md)
- [`src/lib/server/editor/README.md`](./src/lib/server/editor/README.md)
