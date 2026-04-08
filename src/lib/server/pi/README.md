<!--
	Purpose: Document the server-only Pi integration modules shared by chat and editor surfaces.
	Context: Pi support in this repository relies on a strict browser/server boundary and a scoped session architecture.
	Responsibility: Explain the main Pi server modules, their roles, and the boundaries they enforce.
	Boundaries: This README does not replace source comments for individual auth, session, or route modules.
-->

# `src/lib/server/pi`

This folder contains the shared server-only Pi integration used by the standalone chat and editor surfaces.

## Main Areas

- auth and configuration
  `auth.ts`, `models.ts`, `paths.ts`
- shared scoped session and runtime setup
  `session-cookie.ts`, `chat-service.ts`, `session-runtime.ts`, `resource-loader.ts`
- settings-side validation
  `service.ts`
- editor-agent flow
  `editor-agent.ts`, `editor-agent-session.ts`, `editor-agent-edit-tool.ts`, `editor-agent-line-ranges.ts`
- chat message normalization
  `chat-messages.ts`

## Responsibilities

- keep Pi SDK usage on the server
- configure authenticated sessions and model access
- keep chat and editor sessions isolated by scope and cookie
- share one session/runtime core across persistent chat, persistent editor mode, and editor one-shot mode
- define the narrow active-file edit tool used by the editor surface
- normalize session output into browser-safe response payloads

## Boundaries

- Do not import these modules into client components.
- Do not bypass the active-file edit flow with broad repo mutation from the browser.
- Keep browser-side panel behavior in `src/lib/pi`.
- Keep chat and editor scope separation explicit whenever session cookies or session directories change.

See [`../../pi/README.md`](../../pi/README.md) for the client-facing side of the integration and the root [`README.md`](../../../../README.md) for the broader architecture.
