# Feature Plan

This document captures the current architecture rules and the next concrete product steps.

## Current Invariants

- Code stays the primary source of truth.
- `selectedPath` stays the shared source for code, controls, and preview until the product explicitly introduces a second preview target.
- The shared live layer stays optional. Hidden interactive panels must not change the default `code -> preview` flow.
- Missing template metadata, missing parameter blocks, and empty discovery results are valid states and must degrade to empty UI, not errors.
- UI work checks `/Volumes/SSD_Data/GitBase/ui-system/src/lib/components` first.

## Research-Backed Rules

- Svelte 5 shared browser state should live in `.svelte.ts` modules with stable exported objects. Mutate properties instead of reassigning exported `$state`.
- Typed Svelte context is fine for shared editor state when it is cleaner than prop drilling, but it should not replace the main workspace contract.
- Bits UI toolbar and switch patterns should stay close to the documented `Toolbar.Root`, `Toolbar.Group`, `Toolbar.GroupItem`, `Toolbar.Button`, and `Switch.Root` compositions.
- Icon-only actions need explicit accessible names and clear grouped semantics.
- Node/code tooling should keep code as the canonical artifact. Visual state can drive snippets and temporary overrides, but should not become a hidden parallel source of truth.
- Modulation signals should be normalized to `0..1` and mapped to concrete parameter ranges at the target boundary.

## Next Milestones

### 1. Template Folders

Goal:
Move from single-file templates to self-contained template folders.

Why:
- the editor now needs local helper files for controls, node metadata, preview steering, and snippet generation
- templates should be portable and not depend on hidden shared helper libraries

Next steps:
- add a folder-based template discovery model in `static/templates`
- treat one file per template as the user-facing entry file and keep helper files managed but hidden in the editor UI
- migrate workspace bootstrap, create, copy, save, and delete flows from file-based handling to template-folder handling
- keep template metadata machine-readable and local to the template folder
- remove old single-file assumptions once the folder workflow is stable

### 2. Node Editor V2

Goal:
Turn the current node-editor base into a useful modulation tool.

Next steps:
- add `Apply to Code` snippet generation per supported module, starting with a few robust cases such as LFO-driven value modulation
- generate readable, structured code blocks instead of opaque inline patches
- normalize all modulation outputs to `0..1`
- let target nodes map normalized input into real scene ranges instead of carrying redundant local slider UI
- remove or redesign target-local controls that conflict with the modular signal model
- improve node and edge deletion with clear hover, selection, and delete affordances
- remove coarse stepping in modulation paths so animations stay continuous
- refactor node-editor rendering, signal logic, and code generation into clearer module boundaries
- remove obsolete files that become redundant after the refactor

### 3. Controls And Preview Contract

Goal:
Keep controls simple and stable while the editor grows.

Next steps:
- keep controls on the same shared live layer as the node editor
- preserve `selectedPath` as the single file-selection source for code, controls, and preview
- move future control metadata into template-local files once template folders land
- keep graceful degradation strict for files without editable values
- add focused integration coverage around template/file switching and live-layer activation

### 4. Cleanup And Refactor Pass

Goal:
Reduce friction after the recent feature expansion.

Next steps:
- remove dead files, stale placeholders, and duplicate intermediate layers
- align editor UI details with the shared design system
- tighten ownership between workbench state, live layer, controls, and node editor
- keep route components thin and move feature logic back into feature modules where needed
- run lint, type checks, and targeted tests after each cleanup pass

## Later

- tutorial shell and lesson packs on top of the richer template system
- shader-friendly template packs once the template-folder model is stable
- provider expansion after the editor architecture settles
