# AGENTS.md

Purpose: Capture repository-local implementation rules for editor, template workbench, and documentation work.
Context: This project uses SvelteKit, Three.js, and Pi with a strict server/client boundary.
Responsibility: Keep architectural decisions, workflow defaults, and documentation expectations simple and consistent.
Boundaries: This file defines repository guidance, not product behavior.

## Architecture Overview

- `src/routes/three` exposes additive demo milestones. New work should prefer adding the next stage rather than replacing an older route.
- `src/lib/editor` contains UI-focused CodeMirror helpers and should stay free of filesystem or preview orchestration.
- `src/lib/three` contains viewer, editor workspace, template workbench, runtime, preview loader, and shared type modules.
- `src/lib/pi` contains browser-side Pi UI and transport-only types.
- `src/lib/server/pi` contains all Pi SDK usage, session setup, auth, and active-file edit tooling.
- `src/lib/server/three` contains managed file access, preview building, demo bootstrap loaders, and template listing.
- `static/three` is the managed source root for scene files and templates.

## Editor Default

- Use `CodeMirror 6` as the default embedded code editor in this repository.
- Prefer `codemirror` plus focused language packages over heavier editor stacks.
- For `.svelte` editing, prefer `@replit/codemirror-lang-svelte`.
- Only introduce `Monaco Editor` if a request explicitly requires IDE-style features such as diff views, VS Code-like providers, or significantly richer inline editor UX.

## Three Workbench Boundaries

- Keep the shared scene contract centered on `createDemoScene`.
- Scene modules may optionally export `demoRendererKind = 'webgl' | 'webgpu'`, but rendering must still remain compatible with the shared runtime shell.
- Treat template headers and `templateParameters` as optional enhancements. Missing metadata must not break preview or editor flows.
- Keep editor and template workbench orchestration in shared state modules or dedicated server services instead of route components.
- Preserve existing demos. Prefer additive new routes and small refactors over replacing established workbench stages.

## Template System Rules

- Managed templates live under `static/three/templates`.
- Managed editable files are served from `static/three` and created under `static/three/scenes` by the workbench.
- Template metadata should stay machine-readable, minimal, and shared through the template parsing helpers.
- Parameter panels should be driven by shared metadata and must degrade gracefully when a file has no template header.
- Prefer app-compatible adaptations of official Three.js examples over copying full example HTML shells.

## Pi Integration Boundary

- Keep `Pi` SDK imports in server-only modules, route handlers, and `.server.ts` files.
- Treat the browser as a thin client that sends document state, selections, and user intent to server endpoints.
- Prefer structured edit responses and explicit apply flows over hidden automatic file mutation.

## Tooling Default

- Use `bun` as the default package manager and script runner for this repository.
- Prefer `bun add`, `bun remove`, and `bun run` over `npm` equivalents unless a task explicitly requires something else.
- Use `Biome` as the default linter and formatter when linting or formatting is needed in this repository.
- Prefer running `bun run check` and `bunx biome check .` before finishing code changes.

## Documentation Expectations

- The root `README.md` must stay project-specific and reflect the actual architecture, not scaffold text.
- Important architecture folders under `src/lib` and `src/lib/server` should keep a local `README.md` current when responsibilities shift.
- Folder READMEs should describe purpose, main modules, and boundaries. They should not duplicate source code line by line.
- When you add a new workflow milestone or major library surface, update the nearest README in the same change whenever reasonable.
