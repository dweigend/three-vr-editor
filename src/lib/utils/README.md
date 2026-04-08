<!--
	Purpose: Document the small shared utility layer used by reusable UI families.
	Context: The repository now starts introducing ui-system-aligned primitives and blocks that need a tiny common helper surface.
	Responsibility: Explain what belongs in src/lib/utils and keep the boundary against app-specific logic clear.
	Boundaries: This README is a directory guide, not a detailed API reference for each utility.
-->

# `src/lib/utils`

`src/lib/utils` contains small technical helpers that can be shared by reusable UI families.

## What Belongs Here

- class-name helpers
- safe markdown formatting helpers for reusable UI surfaces
- lightweight presentation utilities with no product-specific behavior
- low-level helpers reused by multiple primitives or blocks

## What Does Not Belong Here

- route-specific data shaping
- Three.js runtime logic
- Pi transport or session logic
- feature-specific orchestration that belongs inside a block or app module
