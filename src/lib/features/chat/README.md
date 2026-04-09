<!--
	Purpose: Document the chat-specific client layer under src/lib/features/chat.
	Context: The chat route depends on a small feature subtree for transport and transcript state.
	Responsibility: Explain the role of the chat client modules and keep the boundary against server Pi logic clear.
	Boundaries: This README is a directory guide, not a full API reference for every chat module.
-->

# `src/lib/features/chat`

This folder contains chat-specific client modules for the standalone chat surface.

## Main Areas

- request transport
  `chat-client.ts`, `chat-types.ts`
- client-side transcript state
  `conversation-state.svelte.ts`

## Boundaries

- Keep generic UI in `src/lib/components` and `src/lib/blocks`.
- Keep Pi SDK usage, session management, and model selection in `src/lib/server/pi`.
