# AGENTS.md

## Architecture Overview

- `src/routes/editor`, `src/routes/chat`, and `src/routes/settings` expose the main app surfaces and their supporting endpoints.
- `src/lib/components` contains reusable primitive UI families and thin Bits UI wrappers.
- `src/lib/blocks` contains composed UI families built from local primitives.
- `src/lib/features/editor` contains the editor-facing client modules, preview runtime wiring, workspace state, and template helpers.
- `src/lib/features/chat` contains browser-side chat transport and conversation state.
- `src/lib/server/pi` contains all Pi SDK usage, session setup, auth, and active-file edit tooling.
- `src/lib/server/editor` contains managed file access, preview building, workspace bootstrap loading, and template listing.
- `static/three` is the managed local workspace for editable scene files and should stay generated, not versioned beyond placeholders.
- `static/templates` contains the teaching-oriented starter templates copied into editable scenes.

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

- Managed templates live under `static/templates`.
- Managed editable files are served from `static/three` and created under `static/three/scenes` by the workbench.
- Treat `static/three` as local working state. Commit starter material under `static/templates`, not under `static/three`.
- Template metadata should stay machine-readable, minimal, and shared through the template parsing helpers.
- Parameter panels should be driven by shared metadata and must degrade gracefully when a file has no template header.
- Prefer app-compatible adaptations of official Three.js examples over copying full example HTML shells.
- Comments are optional. Keep them only when they explain a non-obvious constraint, teaching point, or integration detail.

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
