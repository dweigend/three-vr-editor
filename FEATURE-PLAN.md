# Feature Plan

This document turns the high-level items from [`NEXT-STEPS.md`](./NEXT-STEPS.md) into a concrete implementation plan for the next product and feature milestones.

## Planning Assumptions

- The current code editor remains the primary editing surface.
- New visual tooling should sit on top of the existing editor state, preview runtime, and template metadata instead of replacing them.
- The first milestone should stay small and teachable: parameter routing before any broader node or graph editor.
- Tutorial content should build on the existing template system under `static/templates`.
- Model provider work should preserve the server-only Pi integration boundary in `src/lib/server/pi`.
- UI work should inspect `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components` first and reuse those component families before introducing new local primitives.

## Translation Table

| Priority | Original next step | Concrete initiative | Main repo touchpoints | Success signal |
| --- | --- | --- | --- | --- |
| P1 | Add a visual layer on top of the editor without replacing code. | Add a parameter-driven visual control layer that edits known scene values while keeping the code editor as source of truth. | `src/lib/features/editor`, `src/routes/editor`, `static/templates` | A user can adjust scene parameters visually and still see the code update or stay in sync. |
| P1 | Start small: parameter routing first, no large graph system. | Build a small parameter binding system for template metadata, preview-safe updates, and UI controls. | `ThreeTemplateParameterPanel.svelte`, `three-template-source.ts`, `three-template-types.ts`, `three-helpers.ts` | We can ship visual controls without introducing a graph editor or new scene format. |
| P1 | Build a tutorial layer on top of the current editor. | Add a guided lesson shell with steps, hints, and completion checks around the existing editor workspace. | `src/routes/editor`, `src/lib/features/editor`, `static/templates` | A learner can move through a lesson inside the editor without leaving the coding workflow. |
| P1 | Start tutorials with geometry, materials, and lights. | Create the first curriculum pack with small, focused lessons for core Three.js fundamentals. | `static/templates`, new tutorial metadata files | The first lesson pack covers the basic scene building blocks with clear progression. |
| P2 | Add shaders, transforms, and scene composition later. | Expand the tutorial track after the basics with intermediate lesson modules and more advanced parameter sets. | `static/templates`, future tutorial modules | The advanced track reuses the tutorial shell instead of inventing a second learning flow. |
| P2 | Add more applied examples and small interactive scenes. | Add a set of short, remixable scene templates that feel closer to projects than isolated demos. | `static/templates`, preview runtime files | Users can start from small interactive examples instead of blank scenes only. |
| P2 | Make shader workflows easier to teach and explore. | Create shader-friendly templates, focused controls, and examples that expose uniforms and live tweaking clearly. | `static/templates`, `three-helpers.ts`, editor preview modules | Shader lessons feel explorable instead of fragile or hidden in raw code only. |
| P2 | Build a small helper library for common interactions and controls. | Add a minimal scene helper layer for recurring interactions like pointer tracking, camera controls, animation loops, or toggles. | `src/lib/features/editor/three-helpers.ts`, `static/templates` | New templates reuse shared helpers instead of repeating setup code. |
| P3 | Expand beyond OpenRouter. | Introduce provider-aware auth and model configuration instead of hard-coding one provider path. | `src/lib/server/pi`, `src/routes/settings` | The architecture supports more than one provider without forking the UI and runtime flow. |
| P3 | Prioritize Ollama and LM Studio. | Add local-first provider support for Ollama and LM Studio after the provider abstraction is in place. | `src/lib/server/pi`, `src/routes/settings`, docs | Users can configure a local provider from Settings and use it in chat and editor flows. |

## Delivery Phases

## Phase 1: Visual Parameter Routing MVP

**Goal**

Ship the first visual layer on top of the current editor without introducing a graph editor.

**Scope**

- Audit existing template parameter metadata and identify missing information.
- Define a small parameter routing contract for values that can be controlled safely.
- Extend the parameter panel so changes flow through the existing workspace state and preview pipeline.
- Add an optional preview control-panel module for quick parameter access inside the editor workbench.
- Keep the code editor visible and authoritative.

**Likely modules**

- `src/lib/features/editor/LIVE-LAYER-PLAN.md`
- `src/lib/features/editor/ThreeTemplateParameterPanel.svelte`
- `src/lib/features/editor/three-template-source.ts`
- `src/lib/features/editor/three-template-types.ts`
- `src/lib/features/editor/three-editor-workspace-state.svelte.ts`
- `src/lib/features/node-editor`
- `src/lib/features/controlls`
- `static/templates`

**Out of scope**

- Node graph editor
- Visual scene graph manipulation
- Large new editor architecture

**Concrete steps**

1. Create `src/lib/features/node-editor` as an optional browser-only feature area with its own local plan and README.
2. Define the node-editor panel as a sibling module to the existing code, preview, and agent panels in `src/routes/editor/+page.svelte`.
3. Add a dedicated node-editor state layer that consumes active file context and template metadata without depending on Pi or server-only modules.
4. Introduce shared UI primitives and blocks for node cards, parameter targets, inspectors, and visibility controls via `src/lib/components` and `src/lib/blocks`.
5. Build a V1 registry that supports parameter targets plus a very small set of input and modifier nodes.
6. Implement a mapping layer from template parameters to node-editor graph data and back to explicit code updates.
7. Introduce a shared temporary live-parameter layer that can be reused by the node editor and the preview control panel.
8. Add the preview control-panel module as another optional editor sibling that reads editable values dynamically from the active file and template metadata.
9. Route approved node-editor and control-panel changes through `workspaceState.applyDocumentUpdate(...)` so code remains the source of truth.
10. Verify that the editor behaves exactly as before when the node editor or control panel is hidden or unused.

## Shared Live Layer

**Goal**

Keep the current direct code-to-preview workflow as the default path and introduce one shared optional browser-side layer only for interactive modules that need temporary live values.

**Activation rule**

- when node editor and control panel are hidden, keep the current preview flow unchanged
- when one interactive module is visible, allow temporary live overrides through the shared layer
- when no interactive modules remain visible, return to the simple default mode

**Responsibilities**

- discover editable values from template metadata and active-file analysis
- hold temporary live overrides for the active file
- resolve preview-facing values without changing the document immediately
- commit accepted values back through `workspaceState.applyDocumentUpdate(...)`

**Graceful degradation**

- treat missing template metadata as a supported state
- treat missing editable parameter blocks as a supported state
- return empty editable-value lists instead of surfacing errors
- show empty states in node-editor and control-panel modules while leaving preview behavior unchanged

**Planned implementation shape**

- keep the shared layer in `src/lib/features/editor`
- use Svelte 5 `.svelte.ts` state modules with a stable exported object
- use typed Svelte context only when passing the shared layer through component trees is cleaner than prop drilling
- keep the preview runtime changes additive and optional rather than replacing the current pipeline

## UI System Reuse

**External component source**

- `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components`

**Rule**

- inspect the external UI-system component families first for any editor UI change
- prefer copying those components 1:1 over creating new local primitives
- only add or reshape local `src/lib/components` families after checking the external UI-system path first

**First candidates for editor work**

- `switch`
- `slider`
- `separator`
- `toggle`
- `toggle-group`
- `button-group`
- `select`
- `combobox`
- `tooltip`
- `popover`
- `label`
- `field`
- `status-dot`

## Editor Toolbar Refresh

**Goal**

Replace the current editor and agent toolbar layouts with a clearer workbench toolbar system that matches the existing visual language, supports icon-first controls, and stays close to Bits UI and accessibility best practices.

**Primary sources and patterns**

- Bits UI toolbar patterns via `Toolbar.Root`, `Toolbar.Group`, `Toolbar.GroupItem`, and `Toolbar.Button`
- Bits UI switch patterns via `Switch.Root` and `Switch.Thumb`
- WAI-ARIA toolbar guidance for grouped controls, icon-only actions, and panel toggles

**Design goals**

- keep one persistent workbench-level toolbar for editor actions and window visibility
- keep the current editor workflow recognizable while reducing text-heavy buttons
- switch to icon-first actions with explicit accessible names
- separate file actions, document actions, and panel toggles into clearly grouped segments
- align the agent panel header with the same system instead of maintaining a second visual pattern

**Planned layout**

### Main editor toolbar

- file group
  file picker dropdown, create file action, delete current file action
- document action group
  save and redo
- window visibility group
  controls, preview, code, node editor, AI
- status area
  save state remains visible but should not dominate the toolbar

### Agent toolbar

- keep the agent title and current model/mode readable
- replace text-heavy mode controls with a session switch
- use an icon action for creating a new session
- keep settings and send flows outside the toolbar itself

**Best-practice rules from the docs**

- use Bits UI toolbar grouping instead of free-form button rows so keyboard roving focus works through the library
- use grouped toolbar items for panel visibility where single or multiple active states matter
- use `aria-label` on every icon-only action
- use `aria-controls` on panel toggle controls where they target a known pane
- use a real switch for session on/off state rather than a custom toggle button
- keep separators between toolbar groups explicit instead of relying on spacing alone
- avoid inventing custom focus management when Bits UI already provides the toolbar interaction model

**UI-system-first component mapping**

- file picker
  inspect `select` and `combobox` first, then compare with the existing local file picker
- grouped toolbar actions
  inspect `toolbar-button`, `toggle-group`, `button-group`, and `separator`
- session mode
  inspect `switch` first
- icon affordances and hints
  inspect `tooltip` and `status-dot`
- compact parameter controls for future panels
  inspect `slider`, `field`, and `label`

**Concrete planning steps**

1. Define one editor workbench visibility model for `controls`, `preview`, `code`, `node-editor`, and `agent`.
2. Define the toolbar groups and assign each action to exactly one group.
3. Inspect the external UI-system families under `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components` before changing local primitives.
4. Decide whether the file picker should stay on the current local dropdown implementation or move to a copied `select` or `combobox` family from the UI system.
5. Plan the delete-file flow as a real workspace action because it does not exist yet as a server-backed editor capability.
6. Use Bits UI toolbar grouping for panel visibility toggles instead of bespoke button state logic.
7. Use the UI-system `switch` pattern for session mode and keep `new session` as a separate icon action.
8. Keep empty-state and hidden-panel behavior graceful so the toolbar can expose future windows before their internals are fully built.

**Dependencies and risks**

- delete current file needs a new managed file delete flow in the editor workspace
- workbench panel toggles need one shared state model instead of panel-local booleans
- the file picker should remain fast and clear even if the list of scenes grows
- icon-first actions must stay understandable through tooltip and accessible labels

## Node Editor Module Boundaries

**Module position**

The node editor should live in `src/lib/features/node-editor` and remain an optional editor workbench module, not a separate route.

**Interface rules**

- consume active file and template context from the existing editor workspace
- emit explicit browser-side updates back through the existing workspace state
- reuse the shared preview pipeline instead of introducing a second runtime
- share one temporary live-parameter layer between the node editor and the control panel
- avoid any dependency on Pi, provider setup, auth, or session concerns

**Design-system rules**

- put reusable primitives in `src/lib/components`
- put reusable composed UI in `src/lib/blocks`
- keep styling in `src/app.css`
- avoid a separate visual language for the node editor

## Control Panel Module Boundaries

**Module position**

The preview control panel should live in `src/lib/features/controlls` and remain an optional editor workbench module, not a separate route.

**Interaction model**

- sit on the same workbench level as code, preview, agent, and node-editor panels
- dynamically read editable values from the active file and template metadata
- provide grouped, example-style quick controls for high-value preview parameters
- reuse the same temporary live-parameter layer as the node editor

**Shared-layer rule**

The node editor and control panel must not create separate live-edit structures. Both should consume one shared browser-side layer for temporary preview values and explicit write-back into the document.

## Phase 2: Tutorial Shell

**Goal**

Add a guided layer around the existing editor so lessons live inside the current workbench.

**Scope**

- Define a lesson metadata format.
- Add lesson steps, hints, and simple progress state.
- Attach lessons to templates instead of inventing a separate runtime.
- Make the tutorial UI optional and non-blocking for freeform use.

**Likely modules**

- `src/routes/editor/+page.svelte`
- `src/lib/features/editor`
- `static/templates`
- New tutorial metadata or lesson files under a dedicated root

**Success criteria**

- A learner can open a lesson, follow ordered steps, edit code, and preview the result in one place.

## Phase 3: First Learning Track

**Goal**

Ship the first useful lesson series for core Three.js topics.

**Scope**

- Geometry basics
- Material basics
- Light setup and iteration
- Small checkpoints or expected outcomes per lesson

**Content shape**

- Short lessons
- One concept at a time
- Reusable starter scenes

## Phase 4: Reusable Scene Helpers and Applied Examples

**Goal**

Reduce repeated boilerplate and make examples feel closer to real mini-projects.

**Scope**

- Extract a tiny helper layer for common controls and interactions.
- Add small applied scenes that reuse the helper layer.
- Keep helper APIs small, explicit, and tutorial-friendly.

**Candidate helper areas**

- Pointer tracking
- Animation timing
- Basic camera or orbit interaction
- Common input or toggle wiring

## Phase 5: Intermediate Track

**Goal**

Expand the system after the fundamentals are stable.

**Scope**

- Shader exploration lessons
- Transform workflows
- Scene composition exercises
- More advanced parameter sets and helper utilities

**Dependency**

This phase should follow the first tutorial and example passes, not precede them.

## Phase 6: Provider Expansion

**Goal**

Move from an OpenRouter-only setup to a provider-aware model configuration with local-first options.

**Scope**

- Separate provider configuration from model selection.
- Replace OpenRouter-specific assumptions in auth and settings flows with provider-aware structures.
- Add Ollama support first.
- Add LM Studio support next.
- Update the README and settings copy to match the new setup.

**Likely modules**

- `src/lib/server/pi/auth.ts`
- `src/lib/server/pi/models.ts`
- `src/lib/server/pi/session-runtime.ts`
- `src/routes/settings/+page.server.ts`
- `src/routes/settings/+page.svelte`
- `README.md`

**Risks**

- Provider-specific auth and model discovery may differ enough that a shared adapter layer is needed.
- Settings UI should stay simple even when multiple providers are available.

## Recommended Build Order

1. Phase 1: Visual Parameter Routing MVP
2. Phase 2: Tutorial Shell
3. Phase 3: First Learning Track
4. Phase 4: Reusable Scene Helpers and Applied Examples
5. Phase 5: Intermediate Track
6. Phase 6: Provider Expansion

## Open Questions For Planning

- Should visual parameter changes write back into source code immediately, or can some controls stay preview-only during the MVP?
- Should tutorial progress be stored only in memory first, or do we want persistence from the beginning?
- Should the helper library live entirely in `three-helpers.ts`, or should it get its own small module area once two or three helpers exist?
- Should provider expansion wait until the tutorial MVP is shipped, or should local models be brought forward sooner for teaching and cost reasons?
