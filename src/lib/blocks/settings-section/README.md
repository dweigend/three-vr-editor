<!--
	Purpose: Describe the reusable stacked settings section block used for settings-style pages.
	Context: Multiple app surfaces need vertically stacked, titled control groups without route-level shell duplication.
	Responsibility: Provide a consistent header/body section wrapper for forms, lists, and compact summaries.
	Boundaries: This block stays presentational and leaves persistence, validation, and business rules to routes or services.
-->

# `settings-section`

Reusable block family for vertically stacked settings sections.

## Public API

- Export public APIs only through `index.ts`.
- Keep internal implementation details inside `components/`.

## Boundaries

- May compose primitive families from `src/lib/components`.
- Must not absorb server actions or route-specific state management.
