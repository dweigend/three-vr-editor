# `src/lib`

`src/lib` contains the reusable code behind the editor, chat, and settings screens.

## Structure

- [`components`](./components/README.md)
  Reusable UI primitives.
- [`blocks`](./blocks/README.md)
  Composed UI blocks.
- [`features/editor`](./features/editor/README.md)
  Editor-specific client code.
- [`features/chat`](./features/chat/README.md)
  Chat-specific client code.
- [`server`](./server/README.md)
  Server-only logic for Pi and editor workflows.
- [`utils`](./utils/README.md)
  Shared helpers.

## Boundaries

- Browser code belongs in `components`, `blocks`, and `features`.
- Server code belongs in `server`.
- Pi SDK code must stay in server-only modules.
- Shared serializable types can live outside `server` when both sides need them.

See the root [`README.md`](../../README.md) for the repository overview.
