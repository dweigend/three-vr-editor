<!--
	Purpose: Document the server-only subtree under src/lib/server.
	Context: The repository keeps Pi integration and managed Three workflow services behind server boundaries.
	Responsibility: Explain the top-level split between Pi and Three services and point readers to the detailed folder guides.
	Boundaries: This README is a directory map, not a full operational runbook.
-->

# `src/lib/server`

This subtree contains server-only modules that must not be imported into browser components.

## Main Areas

- [`editor`](./editor/README.md)
  Managed editor file access, preview bundling, workspace bootstrap loading, and template discovery.
- [`pi`](./pi/README.md)
  Pi auth, model configuration, session setup, resource loading, and editor-agent orchestration.

## Responsibilities

- hold server-only integrations
- isolate filesystem access and managed path rules
- centralize preview build logic and editor workspace loading
- centralize Pi auth, sessions, and tool execution

## Boundaries

- Browser-facing UI belongs in `src/lib/components`, `src/lib/blocks`, and `src/lib/features`, not here.
- Route handlers may call into this subtree, but route-specific request parsing should remain near the route.
- Shared serializable types may live outside this subtree when they are needed by both client and server.

See the root [`README.md`](../../../README.md) for the overall repository map.
