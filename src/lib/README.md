<!--
	Purpose: Explain the top-level library layout under src/lib for contributors navigating the repository.
	Context: The repository separates editor UI, Three client logic, Pi client logic, and server-only services inside src/lib.
	Responsibility: Point readers to the main library subtrees and describe the client/server split at a high level.
	Boundaries: This README is a directory guide, not a full API reference for every module under src/lib.
-->

# `src/lib`

`src/lib` holds the reusable application code that sits behind the demo routes.

## Main Areas

- [`components`](./components/README.md)
  Reusable primitive families aligned with the local ui-system structure and Bits UI wrappers.
- [`blocks`](./blocks/README.md)
  Composed UI families that sit between primitives and route pages, including the launcher, chat transcript, prompt bar, and settings sections.
- [`editor`](./editor/README.md)
  Thin CodeMirror-oriented UI modules such as the editor shell, file picker, and line diagnostics.
- [`three`](./three/README.md)
  Client-side viewer, preview, runtime, editor workspace, template workbench, and shared Three contracts.
- [`pi`](./pi/README.md)
  Browser-side Pi panel UI and transport-only request/response types.
- [`server`](./server/README.md)
  Server-only services for Pi integration and managed Three file/preview workflows.

## Client and Server Split

- Browser-facing UI modules belong in `components`, `blocks`, `editor`, `three`, and `pi`.
- Server-only logic belongs in `server`.
- Pi SDK code must stay in server-only modules.
- Shared serializable types can live in client-safe folders when they are needed on both sides.

## What Belongs Here

- reusable UI modules
- shared primitive and block families
- shared runtime and transport types
- client-safe helpers used by multiple routes
- server-only services under the `server` subtree

## What Does Not Belong Here

- route-only page composition that is specific to one `src/routes` entrypoint
- unmanaged filesystem access from browser-facing components
- Pi SDK imports in client modules

See the root [`README.md`](../../README.md) for the broader repository overview.
