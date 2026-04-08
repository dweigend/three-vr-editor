<!--
	Purpose: Document the server-only Pi integration modules used by the editor-agent demo.
	Context: Pi support in this repository relies on a strict browser/server boundary and a specialized active-file edit flow.
	Responsibility: Explain the main Pi server modules, their roles, and the boundaries they enforce.
	Boundaries: This README does not replace source comments for individual auth or session modules.
-->

# `src/lib/server/pi`

This folder contains the server-only Pi integration used by the editor-agent demo.

## Main Areas

- auth and configuration
  `auth.ts`, `models.ts`, `paths.ts`
- session and runtime setup
  `session.ts`, `session-runtime.ts`, `resource-loader.ts`, `service.ts`
- editor-agent flow
  `editor-agent.ts`, `editor-agent-session.ts`, `editor-agent-edit-tool.ts`, `editor-agent-line-ranges.ts`
- chat message normalization
  `chat-messages.ts`

## Responsibilities

- keep Pi SDK usage on the server
- configure authenticated sessions and model access
- define the narrow active-file edit tool used by the editor-agent demo
- normalize session output into browser-safe response payloads

## Boundaries

- Do not import these modules into client components.
- Do not bypass the active-file edit flow with broad repo mutation from the browser.
- Keep browser-side panel behavior in `src/lib/pi`.

See [`../../pi/README.md`](../../pi/README.md) for the client-facing side of the integration and the root [`README.md`](../../../../README.md) for the broader architecture.
