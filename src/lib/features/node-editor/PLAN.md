# Node Editor Plan

This document tracks the local implementation plan for the optional node-editor module.

## Goal

Build a visual editor module that can be toggled inside the existing editor workbench without replacing the code editor or depending on Pi.

## Product Rules

- The node editor is not a separate app surface.
- The node editor is optional and can be hidden without side effects.
- The code editor remains the primary source of truth.
- The node editor only works through defined interfaces to the existing workspace state.
- The node editor must use the shared live layer defined in `src/lib/features/editor/LIVE-LAYER-PLAN.md`.
- The node editor uses the shared design system instead of introducing a parallel one.
- If the active file exposes no editable values, the node editor must show an empty state instead of failing.
- For node-editor UI work, inspect `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components` first and reuse matching component families before creating local primitives.

## V1 Scope

- add a node-editor panel on the same level as code, preview, and agent
- support parameter-oriented nodes rather than a full general-purpose graph editor
- read editable parameter definitions from template metadata
- write changes back through the existing workspace update flow
- reflect results through the current preview pipeline

## Out Of Scope

- separate route or standalone app shell
- dependency on Pi, sessions, auth, or model providers
- broad scene-graph editing
- shader graph authoring
- a second rendering runtime

## Empty-State Rule

- Missing template metadata is valid.
- Missing editable parameter blocks are valid.
- An empty list of editable values is valid.
- In all of those cases the node editor should render a calm empty state and leave the editor workflow untouched.

## Concrete Steps

1. Define the browser-side interfaces between editor workspace state, template metadata, and node-editor state.
2. Add workbench visibility state so the node editor can be shown or hidden like the other editor modules.
3. Create shared UI primitives and composed blocks needed for node cards, catalog items, handles, and inspectors.
4. Build the initial node-editor panel shell with empty-state, toolbar, and panel layout.
5. Add a small registry for V1 node types and parameter output nodes.
6. Implement the first mapping layer from template parameters to node-editor graph data through the shared live layer.
7. Connect node changes to the shared live layer first and only then to `workspaceState.applyDocumentUpdate(...)` through an explicit commit adapter.
8. Validate that the node editor stays inert when hidden and does not affect the normal editor flow.

## First Candidate Files

- `src/routes/editor/+page.svelte`
- `src/lib/features/editor/LIVE-LAYER-PLAN.md`
- `src/lib/features/editor/three-editor-workspace-state.svelte.ts`
- `src/lib/features/editor/three-template-source.ts`
- `src/lib/features/editor/three-template-types.ts`
- `src/lib/features/node-editor/`
- `src/lib/components/`
- `src/lib/blocks/`
- `src/app.css`
- `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components`
