# `static/templates`

This folder contains the starter material shown in the editor workbench.

## Current State

- today, picker-visible templates are still single-file scene sources
- files using `defineThreeTemplateUi(...)` are preferred
- legacy `@three-template` headers remain a fallback during migration

## Target Direction

Templates should move to self-contained folders:

- one user-visible entry file
- local helper files for controls, node-editor metadata, preview steering, and snippet generation
- template-local helper modules instead of hidden shared dependencies

## Rules

- keep templates teaching-oriented and close to official Three.js patterns
- keep metadata machine-readable and minimal
- keep the shared `createDemoScene` contract intact
- missing editable metadata is valid and must not break preview or editor modules
- commit starter material here, not in `static/three`
