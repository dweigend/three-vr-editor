# AGENTS.md

## Architecture Overview

- `src/routes/editor`, `src/routes/chat`, and `src/routes/settings` expose the main app surfaces.
- `src/lib/components` contains reusable primitive UI families and thin Bits UI wrappers.
- `src/lib/blocks` contains composed UI families built from local primitives.
- `src/lib/features/editor` contains workbench state, preview wiring, template helpers, and the shared live layer.
- `src/lib/features/controlls` contains the optional preview control panel.
- `src/lib/features/node-editor` contains the optional node editor.
- `src/lib/server/editor` contains managed file access, workspace bootstrap, template discovery, and preview bundling.
- `src/lib/server/pi` contains all Pi SDK usage and must stay server-only.

## UI Source Of Truth

- Inspect `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components` first for any UI change.
- Reuse external UI-system components 1:1 when they fit.
- Only extend local `src/lib/components` or `src/lib/blocks` after checking the external UI system.
- Stay close to documented Bits UI patterns for toolbar, switch, dropdown, and popover behavior.

## Editor Invariants

- Code stays the primary source of truth.
- `selectedPath` stays the shared source for code, controls, and preview unless the product explicitly introduces a second preview target.
- The shared live layer is optional and must stay inert when interactive panels are hidden.
- Missing template metadata or missing parameter blocks must degrade to empty states, never errors.
- Keep the shared scene contract centered on `createDemoScene`.

## Svelte Rules

- For shared browser-side state, prefer `.svelte.ts` modules with stable exported objects.
- Mutate exported `$state` properties instead of reassigning exported `$state` bindings.
- Use typed Svelte context when it simplifies component-tree wiring, not as a replacement for the workspace contract.

## Template System Rules

- Today, starter templates live under `static/templates` and editable scene files live under `static/three`.
- New template work should be designed for the upcoming folder-based template model.
- The target model is one self-contained template folder with one user-visible entry file plus local helper files for controls, node metadata, preview steering, and snippet generation.
- Avoid hidden cross-template helper dependencies when template-local helpers are the better fit.
- Keep template metadata machine-readable and minimal.
- Prefer app-compatible adaptations of official Three.js examples over copying full example shells.

## Cleanup Rule

- After larger feature additions, remove obsolete files, placeholders, and duplicate layers instead of leaving dead structure behind.

## Tooling Default

- Use `bun` as the default package manager and script runner.
- Use `Biome` as the default linter and formatter.
- Prefer running `bun run check` and `bunx biome check .` before finishing changes.

## Documentation Expectations

- Keep the root `README.md` project-specific and current.
- Keep local `README.md` files current when feature boundaries shift.
- Keep docs short, concrete, and architecture-focused.
