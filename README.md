# three-vr-editor

`three-vr-editor` is a teaching-focused Three.js workbench with code editing, live preview, optional controls, an optional node editor, and an AI panel.

## Current Surfaces

- `/editor`
  code, preview, controls, node editor, and AI in one workbench
- `/chat`
  separate chat surface
- `/settings`
  provider key and model settings

## Current Architecture

- code stays the primary editing surface
- preview stays compatible with the shared `createDemoScene` contract
- controls and node editor use one optional shared live layer
- `selectedPath` stays the shared source for code, controls, and preview
- Pi stays server-only

## Current Workspace Model

- starter templates live in `static/templates`
- managed editable scene files live in `static/three`
- template metadata is optional and must never break preview or editor flows

## Planned Direction

The next major architecture shift is a move from single-file templates to self-contained template folders:

- one user-visible entry file
- local helper files for controls, node metadata, preview steering, and snippet generation
- no hidden cross-template helper dependencies

## Tech Stack

- `bun`
- `svelte 5`
- `@sveltejs/kit`
- `three`
- `bits-ui`
- `codemirror`
- `biome`

## Project Structure

- `src/lib/components`
  reusable UI primitives
- `src/lib/blocks`
  composed UI blocks
- `src/lib/features/editor`
  workbench state, preview runtime, live layer, and template helpers
- `src/lib/features/controlls`
  optional preview control panel
- `src/lib/features/node-editor`
  optional node editor
- `src/lib/server/editor`
  managed files, template discovery, and preview builds
- `src/lib/server/pi`
  server-only Pi integration
