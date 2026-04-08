<!--
	Purpose: Describe the reusable launcher block used for the application's primary entry surfaces.
	Context: The simplified root screen should present a small fixed set of destinations without repeating card composition in route files.
	Responsibility: Define the public block boundary and keep route-level pages focused on content, not layout plumbing.
	Boundaries: This block stays presentational and does not own routing state, permissions, or product logic.
-->

# `app-launcher`

Reusable block family for a compact application launch grid.

## Public API

- Export public APIs only through `index.ts`.
- Keep internal implementation details inside `components/`.

## Boundaries

- May compose primitive families from `src/lib/components`.
- Must not absorb route-specific state or server actions.
