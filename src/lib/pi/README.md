<!--
	Purpose: Describe the browser-side Pi integration layer used by the nested editor Pi demo.
	Context: The repository keeps Pi SDK logic server-only and exposes a thin client panel plus transport-safe types here.
	Responsibility: Explain what this folder owns and reaffirm the client/server boundary around Pi.
	Boundaries: This README does not document server-side Pi sessions or model configuration details.
-->

# `src/lib/pi`

This folder contains the browser-side Pi UI surface and the small transport contracts shared with server endpoints.

## Main Modules

- `chat-client.ts`
  Thin browser transport helpers for starting a chat session and sending prompt turns.
- `chat-types.ts`
  Shared request and response contracts for the standalone chat route.
- `conversation-state.svelte.ts`
  Shared optimistic conversation state for chat-style Pi surfaces.
- `EditorAgentPanel.svelte`
  Thin client panel for sending the active file context and local prompts to the server endpoint.
- `editor-agent-client.ts`
  Small fetch helper for the file-aware editor agent endpoint.
- `editor-agent-types.ts`
  Shared request/response and applied-edit transport types.

## Responsibilities

- render the Pi panel UI
- keep optimistic conversation behavior shared between chat surfaces
- collect prompt input and local panel state
- send structured requests to the server
- receive and apply structured edit payloads in the workspace flow

## Boundaries

- No Pi SDK imports belong here.
- No model selection, auth, session setup, or tool definition belongs here.
- This folder should stay transport- and UI-focused.

The server-side Pi implementation lives under [`../server/pi`](../server/pi/README.md).
