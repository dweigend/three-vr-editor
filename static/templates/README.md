<!--
	Purpose: Document how Three.js template files in this folder should be
	written for students.
	Context: The template workbench copies files from this folder into editable scenes.
	Responsibility: Capture the expected structure, naming, and teaching style
	for template authors.
	Boundaries: This guide does not replace source-level comments inside
	individual templates.
-->

# `static/templates`

This folder contains the starter templates shown in the Three editor workbench.

- Files with a valid `@three-template` header are listed in the picker.
- Helper files such as `README.md` or plain `.ts` notes without a template header stay ignored by the picker.

## Teaching Goal

Each template should help students understand one clear Three.js idea without hiding the
important steps in clever abstractions.

## Template Structure

Keep each template in this order:

1. File header comment
2. `@three-template` metadata block
3. imports
4. `templateParameters` section near the top
5. short typed helper functions
6. `createDemoScene` as the main orchestration function

## Style Rules

- Write the explanation and comments in English.
- Keep the line length around 90 characters so the editor can show the code without hard
  wrapping.
- Use descriptive names such as `terrainMarker`, `waveSpeed`, or `surfaceMaterial`.
- Read `templateParameters` into one typed settings object instead of repeating
  `Number(...)` and `String(...)` throughout the file.
- Keep functions small and focused. Split setup, animation, pointer handling, and cleanup
  into named helpers when a scene starts to feel crowded.
- Add inline comments only for ideas that help students understand why something
  is needed.

## Three.js And TSL Notes

- Stay close to official Three.js patterns and imports.
- Use `three/webgpu` for WebGPU templates and keep renderer-specific code explicit.
- Use TSL only when a template already needs node materials or node-based post-processing.
- Preserve the shared `createDemoScene` contract and the existing `templateParameters`
  block format so the workbench can still parse the file.
