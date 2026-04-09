<!--
	Purpose: Capture library-level follow-up work discovered during the route consolidation.
	Context: The route refactor intentionally focused on flattening pages and URL structure first, without mixing in a full src/lib redesign.
	Responsibility: Provide a clean handoff list for the next cleanup session.
	Boundaries: This file records observations and next actions; it does not define product behavior.
-->

# Route Refactor Follow-up

## Status

This log was created during the route consolidation on 2026-04-09.
The route layer is flatter now, but several `src/lib` areas still carry historical demo structure and should be cleaned up separately.

## Next Session Targets

- `src/lib/three/three-editor-workspace-state.svelte.ts`
  The module still mixes transport details, preview scheduling, document caching, and save orchestration in one state object. Split endpoint transport helpers from the shared state so the workspace logic becomes easier to test and reuse.

- `src/lib/pi/EditorAgentPanel.svelte`
  This is still a large mixed-responsibility component. The next cleanup should separate transport state, mode switching, and composer rendering into smaller route-agnostic pieces or a focused block family.

- `src/lib/pi/chat-client.ts` and `src/lib/pi/editor-agent-client.ts`
  These are thin and useful, but the transport layer is still duplicated. A shared request helper for JSON error handling would remove repetition without adding much abstraction.

- `src/lib/server/three/files.ts` and related template helpers
  Re-check whether file creation, template copying, and path summary building can be simplified further now that there is only one editor page.

- `src/lib/server/pi/models.ts`
  The persisted model catalog is static and page-driven today. Decide whether this should stay as app configuration or move toward a smaller typed settings service.

- `src/routes/settings/+page.server.ts`
  The action logic is clearer now, but key actions still repeat the same load-state pattern. A small settings service or action helper could remove the remaining duplication.

- `src/lib/three` naming
  The folder still carries legacy names like `ThreeFileCreatePanel` and `ThreeTemplateParameterPanel`. Re-evaluate whether the `Three*` prefix still helps or whether cleaner family-oriented names would read better.

- `src/lib/pi` and `src/lib/three` family placement
  Several Svelte components are still feature-specific rather than clearly reusable UI primitives or blocks. Compare them against the `ui-system` layering rules and decide what belongs in `components`, `blocks`, route-local folders, or plain feature modules.

- Documentation drift
  Re-scan `wireframes/README.md`, remaining folder READMEs, and comments for references to old demo routes or the previous nested structure.
