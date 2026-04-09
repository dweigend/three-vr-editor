<!--
	Purpose: Capture library-level follow-up work discovered during the route consolidation.
	Context: The route refactor intentionally focused on flattening pages and URL structure first, without mixing in a full src/lib redesign.
	Responsibility: Provide a clean handoff list for the next cleanup session.
	Boundaries: This file records observations and next actions; it does not define product behavior.
-->

# Route Refactor Follow-up

## Status

This log was created during the route consolidation on 2026-04-09 and updated during the library cleanup in the same session.
The route layer is flat now and the library split is cleaner, but a few focused simplifications still remain for the next session.

## Next Session Targets

- `src/lib/features/editor/three-editor-workspace-state.svelte.ts`
  The module still mixes transport details, preview scheduling, document caching, and save orchestration in one state object. Split endpoint transport helpers from the shared state so the workspace logic becomes easier to test and reuse.

- `src/lib/features/editor/EditorAgentPanel.svelte`
  This is still a large mixed-responsibility component. The next cleanup should separate transport state, mode switching, and composer rendering into smaller route-agnostic pieces or a focused block family.

- `src/lib/features/chat/chat-client.ts` and `src/lib/features/editor/editor-agent-client.ts`
  These are thin and useful, but the transport layer is still duplicated. A shared request helper for JSON error handling would remove repetition without adding much abstraction.

- `src/lib/server/editor/files.ts` and related template helpers
  Re-check whether file creation, template copying, and path summary building can be simplified further now that there is only one editor page.

- `src/lib/server/pi/models.ts`
  The persisted model catalog is static and page-driven today. Decide whether this should stay as app configuration or move toward a smaller typed settings service.

- `src/routes/settings/+page.server.ts`
  The action logic is clearer now, but key actions still repeat the same load-state pattern. A small settings service or action helper could remove the remaining duplication.

- `src/lib/features/editor` naming
  The folder still carries names like `ThreeFileCreatePanel` and `ThreeTemplateParameterPanel`. Re-evaluate whether the `Three*` prefix still helps or whether clearer family-oriented names would read better.

- Feature-to-library placement
  Several Svelte components are still feature-specific rather than clearly reusable UI primitives or blocks. Compare them against the `ui-system` layering rules and decide what belongs in `components`, `blocks`, route-local folders, or plain feature modules.

- Documentation drift
  Re-scan `wireframes/README.md`, remaining folder READMEs, and comments for references to old demo routes or the previous nested structure.
