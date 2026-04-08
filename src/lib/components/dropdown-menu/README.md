<!--
	Purpose: Document the reusable dropdown-menu primitive family and its compact field wrapper.
	Context: Settings-style selectors should reuse one Bits-UI-based menu surface instead of mixing native selects and route-local markup.
	Responsibility: Describe the public dropdown-menu API, the higher-level `Field` helper, and the intended import boundary.
	Boundaries: This README covers the local primitive family only and does not define app-specific menu actions.
-->

# `dropdown-menu`

This family provides thin wrappers around the official Bits UI `DropdownMenu` API plus a compact `Field` helper for form-like selection UIs.

## Public API

- `Root`
- `Trigger`
- `Portal`
- `Content`
- `Item`
- `Field`

## Notes

- `Field` is the reusable option picker used for compact settings surfaces.
- The dropdown content matches the trigger width through Bits UI anchor CSS variables.
- Keep domain behavior outside this family. Pass options, labels, and actions in from routes or blocks.
