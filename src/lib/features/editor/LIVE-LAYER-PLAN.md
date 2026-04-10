# Editor Live Layer Plan

This document defines the optional shared live-parameter layer for editor modules such as the node editor and the control panel.

## Goal

Keep the current code-to-preview workflow unchanged by default and add a shared browser-side layer only for optional interactive editor modules that need temporary live values.

## Design Principles

- Keep the default editor flow as simple as it is today.
- Activate the live layer only when an interactive module needs it.
- Keep the code document as the source of truth.
- Use one shared layer for node-editor and control-panel behavior.
- Reuse Svelte 5 state patterns instead of introducing a custom client-state abstraction.
- For shared editor UI around this layer, inspect `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components` first before introducing local primitives.

## Default And Interactive Modes

### Default mode

- code changes update the preview exactly as they do today
- no live overrides are created
- no extra shared state is required

### Interactive mode

- code still remains the source of truth
- optional modules can register temporary live overrides
- preview can resolve values through the shared layer before rendering
- explicit commit paths write accepted values back into the document

## Responsibilities

The shared live layer is responsible for:

- discovering editable values from template metadata and active-file analysis
- storing temporary live overrides for the active file
- exposing resolved values for preview-facing consumers
- tracking whether the layer is active or idle
- clearing or resetting temporary overrides when modules are hidden or disposed
- promoting accepted changes into explicit document updates

The shared live layer is not responsible for:

- owning the main document state
- replacing the existing preview builder
- depending on Pi, auth, provider configuration, or server-only modules
- creating feature-specific UI

## Graceful Degradation Rule

- If the active file exposes no editable values, the shared layer must return an empty result instead of throwing an error.
- If template metadata is missing, the shared layer must stay idle and leave the current editor and preview flow untouched.
- If a file has a template header but no editable parameter block, the shared layer must not fail. It should expose no editable live values until a supported block exists.
- Empty discovery results are a valid state, not an error condition.

## Planned Files

- `editor-live-layer-types.ts`
- `editor-live-layer.svelte.ts`
- `editor-live-layer-discovery.ts`
- `editor-live-layer-commit.ts`
- optional context helper such as `editor-live-layer-context.ts`

## Integration Boundaries

### With workspace state

- read active file context and template metadata from the existing editor state
- never replace `workspaceState`
- route committed changes through `workspaceState.applyDocumentUpdate(...)`

### With node editor

- read editable definitions and temporary values from the shared layer
- write graph-driven temporary overrides into the shared layer
- do not create a second live state structure inside `src/lib/features/node-editor`
- treat an empty discovery result as a normal empty-state panel

### With control panel

- read editable definitions and temporary values from the shared layer
- write panel-driven temporary overrides into the shared layer
- do not create a second live state structure inside `src/lib/features/controlls`
- treat an empty discovery result as a normal empty-state panel

### With preview runtime

- keep the normal direct preview flow as the default path
- only resolve through the shared layer when interactive modules are active
- avoid introducing a separate preview runtime or route

## Activation Model

- the layer should stay idle when neither node editor nor control panel is visible
- the layer should activate when one of those modules is shown
- the layer should be able to return to idle when no interactive module depends on it
- hidden modules must not leave stale runtime behavior behind

## Svelte Integration Notes

- keep the shared state in `.svelte.ts` files so Svelte 5 runes can be used directly
- export a stable state object and mutate properties instead of reassigning the object
- use typed Svelte context only when passing the live layer through component subtrees is cleaner than prop plumbing
- create effectful preview bindings only while the layer is active

## Concrete Steps

1. Define the shared type contract for discovered parameters, temporary overrides, resolved values, and commit requests.
2. Implement a browser-side `.svelte.ts` state module with an always-stable exported object.
3. Add activation state so the layer only performs work while interactive modules are visible.
4. Add discovery logic that merges template metadata and active-file analysis into one editable-parameter list.
5. Add a resolve step that returns either document values or temporary override values for preview-facing consumers.
6. Add an explicit commit adapter that converts accepted temporary values into `workspaceState.applyDocumentUpdate(...)` calls.
7. Connect node-editor and control-panel plans to the same shared layer instead of feature-local live state.
8. Verify that disabling interactive modules restores the current simple code-to-preview behavior.
