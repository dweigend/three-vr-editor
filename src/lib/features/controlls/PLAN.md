# Control Panel Plan

This document tracks the local implementation plan for the optional control-panel module.

## Goal

Build a compact preview control panel inside the editor workbench that can discover editable values dynamically and apply live changes through the same temporary parameter layer as the node editor.

## Product Rules

- The control panel is not a separate app surface.
- The control panel is optional and can be hidden without side effects.
- The control panel lives on the same level as code, preview, agent, and the node editor.
- The code editor remains the primary source of truth.
- The control panel must use the shared live layer defined in `src/lib/features/editor/LIVE-LAYER-PLAN.md`.
- The control panel uses the shared design system instead of introducing a parallel one.
- If the active file exposes no editable values, the control panel must show an empty state instead of failing.
- For control-panel UI work, inspect `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components` first and reuse matching component families before creating local primitives.

## V1 Scope

- add a control-panel module inside the existing editor workbench
- dynamically discover editable values from the active file and template metadata
- group controls into simple sections similar to the Three.js examples pattern
- apply live preview changes through the shared temporary parameter layer
- keep explicit write-back paths into the existing workspace update flow

## Out Of Scope

- separate route or standalone app shell
- dependency on Pi, sessions, auth, or model providers
- a second live-edit or preview runtime
- custom one-off controls that bypass the shared parameter layer
- complex scene inspection beyond exposed editable values

## Shared Layer Requirement

The control panel and the node editor should both depend on the same browser-side intermediate layer for:

- reading editable parameter definitions
- holding temporary live values
- applying live preview changes
- promoting accepted changes into explicit document updates

This shared layer should exist once in the editor feature area and should not be duplicated in feature-local state.

## Empty-State Rule

- Missing template metadata is valid.
- Missing editable parameter blocks are valid.
- An empty list of editable values is valid.
- In all of those cases the control panel should render no controls or a calm empty state and leave preview behavior unchanged.

## Session Learnings

- The control panel must follow the same selected-file flow as the code editor and preview. If file switching updates code but not controls, the architecture is already in an invalid state.
- Keep the panel compact. Duplicate meta labels such as repeated code values, section counters, and descriptive cards add noise without helping the editing workflow.
- Empty states should be calm and minimal, but they must still describe the current file accurately. Showing stale empty-state copy from a previous file is a real bug, not a cosmetic issue.
- Reuse the shared live layer for parameter discovery and override handling, but keep layout and formatting concerns local to the control-panel feature so UI cleanup does not force state changes.
- Prefer one compact list of controls over nested cards and group shells unless grouping adds real editing value.

## Concrete Steps

1. Adopt the shared temporary parameter layer contract from `src/lib/features/editor/LIVE-LAYER-PLAN.md`.
2. Add workbench visibility state so the control panel can be shown or hidden like the other editor modules.
3. Define discovery rules for editable values from template metadata and active-file analysis.
4. Create shared UI primitives and blocks for grouped parameter sections, toggles, sliders, numeric fields, and compact control rows.
5. Build the initial control-panel shell with collapsible groups and empty states.
6. Connect control changes to the shared temporary parameter layer so preview values update immediately.
7. Connect accepted or persisted changes back to `workspaceState.applyDocumentUpdate(...)` through the shared live-layer commit path.
8. Validate that the control panel stays inert when hidden and does not affect the normal editor flow.

## First Candidate Files

- `src/routes/editor/+page.svelte`
- `src/lib/features/editor/LIVE-LAYER-PLAN.md`
- `src/lib/features/editor/three-editor-workspace-state.svelte.ts`
- `src/lib/features/editor/three-template-source.ts`
- `src/lib/features/editor/three-template-types.ts`
- `src/lib/features/controlls/`
- `src/lib/features/node-editor/`
- `src/lib/components/`
- `src/lib/blocks/`
- `src/app.css`
- `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components`
