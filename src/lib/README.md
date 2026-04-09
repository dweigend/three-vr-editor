<!--
	Purpose: Explain the top-level library layout under src/lib for contributors navigating the repository.
	Context: The repository separates editor UI, Three client logic, Pi client logic, and server-only services inside src/lib.
	Responsibility: Point readers to the main library subtrees and describe the client/server split at a high level.
	Boundaries: This README is a directory guide, not a full API reference for every module under src/lib.
-->

# `src/lib`

`src/lib` holds the reusable application code behind the three main app surfaces: editor, chat, and settings.

## Main Areas

- [`components`](./components/README.md)
  Reusable primitive families aligned with the local ui-system structure and Bits UI wrappers.
- [`blocks`](./blocks/README.md)
  Composed UI families that sit between primitives and route pages.
- [`features/editor`](./features/editor/README.md)
  Editor-specific client modules such as CodeMirror integration, preview runtime wiring, and workspace state.
- [`features/chat`](./features/chat/README.md)
  Chat-specific client transport and conversation state.
- [`server`](./server/README.md)
  Server-only services for Pi integration and managed editor file/preview workflows.
- [`utils`](./utils/README.md)
  Small shared technical helpers for reusable library code.

## Client and Server Split

- Browser-facing UI modules belong in `components`, `blocks`, and `features`.
- Server-only logic belongs in `server`.
- Pi SDK code must stay in server-only modules.
- Shared serializable types can live in client-safe folders when they are needed on both sides.

## What Belongs Here

- reusable UI modules
- shared primitive and block families
- feature-local state, transport, and parser modules
- client-safe helpers used by multiple routes
- server-only services under the `server` subtree

## What Does Not Belong Here

- route-only page composition that is specific to one `src/routes` entrypoint
- unmanaged filesystem access from browser-facing components
- Pi SDK imports in client modules

See the root [`README.md`](../../README.md) for the broader repository overview.
