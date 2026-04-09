# `static/templates`

This folder contains the starter templates shown in the Three editor workbench.

- Files with `templateUi = defineThreeTemplateUi(...)` are listed in the picker.
- Legacy `@three-template` headers still work as a fallback while older files are
  migrated.
- Helper files such as `README.md` stay ignored by the picker.

## Teaching Goal

Each template should help students understand one clear Three.js idea without hiding the
important steps in clever abstractions.

## Template Structure

Keep each template in this order:

1. File header comment
2. imports
3. `templateUi` near the top
4. `templateParameters` near the top
5. short typed helper functions
6. `createDemoScene` as the main orchestration function

## Style Rules

- Write the explanation and comments in English.
- Keep the tone friendly and direct. This code should feel like a teaching script,
  not an API manual.
- Keep the line length around 90 characters so the editor can show the code without hard
  wrapping.
- Use descriptive names such as `terrainMarker`, `waveSpeed`, or `surfaceMaterial`.
- Read `templateParameters` into one typed settings object instead of repeating
  `Number(...)` and `String(...)` throughout the file.
- Import shared helpers from `$lib/features/editor/three-helpers`.
- Keep functions small and focused. Split setup, animation, pointer handling, and cleanup
  into named helpers when a scene starts to feel crowded.
- Add inline comments only for ideas that help students understand why something
  is needed.

## Three.js And TSL Notes

- Stay close to official Three.js patterns and imports.
- Use `three/webgpu` for WebGPU templates and keep renderer-specific code explicit.
- Use TSL only when a template already needs node materials or node-based post-processing.
- Preserve the shared `createDemoScene` contract so the workbench can still run the file.
- Use `defineThreeTemplateUi(...)` and `defineThreeTemplateParameters(...)` so the
  editor can read and rewrite metadata safely.
