# `src/lib/server/pi`

This folder contains the server-only Pi integration shared by the chat, editor, and settings surfaces.

## Main Areas

- auth and configuration
  `auth.ts`, `models.ts`, `paths.ts`, `openrouter-validation.ts`
- shared scoped session setup
  `session-cookie.ts`, `session-runtime.ts`, `resource-loader.ts`
- chat orchestration
  `chat-service.ts`, `chat-messages.ts`
- editor-agent orchestration
  `editor-agent.ts`, `editor-agent-session.ts`, `editor-agent-edit-tool.ts`, `editor-agent-line-ranges.ts`

## Responsibilities

- keep all Pi SDK usage on the server
- configure authenticated model access from the stored OpenRouter key
- isolate chat and editor sessions by cookie scope and managed session directory
- share one runtime core across persistent chat, persistent editor mode, and one-shot editor requests
- expose the narrow active-file edit tool used by the editor surface
- normalize Pi session output into browser-safe payloads

## Boundaries

- Do not import these modules into client components.
- Do not bypass the active-file edit flow with broad browser-side file mutation.
- Keep browser-safe transport and UI state in `src/lib/features/chat` and `src/lib/features/editor`.
- Keep scope separation explicit whenever session cookies or session directories change.
