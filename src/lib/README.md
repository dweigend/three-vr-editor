# `src/lib`

`src/lib` contains the reusable browser and shared logic behind the editor, chat, and settings surfaces.

## Structure

- [`components`](./components/README.md)
  primitive UI families
- [`blocks`](./blocks/README.md)
  composed UI blocks
- [`features/editor`](./features/editor/README.md)
  workbench state, preview runtime, live layer, and template helpers
- [`features/controlls`](./features/controlls/README.md)
  optional preview control panel
- [`features/node-editor`](./features/node-editor/README.md)
  optional node editor
- [`features/chat`](./features/chat/README.md)
  chat-specific client code
- [`server`](./server/README.md)
  server-only editor and Pi logic
- [`utils`](./utils/README.md)
  shared helpers

## Boundaries

- Browser code belongs in `components`, `blocks`, and `features`.
- Server code belongs in `server`.
- Pi SDK code stays server-only.
- Shared serializable types may live outside `server` when both sides need them.
