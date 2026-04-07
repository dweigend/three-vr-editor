# AGENTS.md

Purpose: Capture repository-local implementation rules for editor work.
Context: This project uses SvelteKit and Pi on a strict server/client boundary.
Responsibility: Keep editor choices and integration defaults simple and consistent.
Boundaries: This file defines project guidance, not product behavior.

## Editor Default

- Use `CodeMirror 6` as the default embedded code editor in this repository.
- Prefer `codemirror` plus focused language packages over heavier editor stacks.
- For `.svelte` editing, prefer `@replit/codemirror-lang-svelte`.
- Only introduce `Monaco Editor` if a request explicitly requires IDE-style features such as diff views, VS Code-like providers, or significantly richer inline editor UX.

## Pi Integration Boundary

- Keep `Pi` SDK imports in server-only modules, route handlers, and `.server.ts` files.
- Treat the editor as a thin client that sends document state, selections, and user intent to server endpoints.
- Prefer structured edit responses and explicit apply flows over hidden automatic file mutation.
