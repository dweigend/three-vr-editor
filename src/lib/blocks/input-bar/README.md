<!--
	Purpose: Describe the reusable input-bar block copied and adapted from the ui-system chat composer pattern.
	Context: Chat and editor prompts should share one compact input module instead of route-specific composer markup.
	Responsibility: Define the family boundary for a textarea-based input row with optional leading and trailing controls.
	Boundaries: The block stays presentational and leaves submission, async state, and domain logic to consumers.
-->

# `input-bar`

Reusable input-row block for chat, editor prompts, and other command-style entry surfaces.

## Purpose

- compose a multiline input with optional leading and trailing controls
- keep compact prompt-entry styling consistent across chat and editor flows
- support disabled states and dynamic width without route-specific CSS

## Public API

- `InputBar` as the composed family root

## Boundaries

- import primitives from `src/lib/components`
- keep fetch, form submission, and business rules in consuming routes or features
