<!--
	Purpose: Describe the public single-line input primitive used across forms and compact control rows.
	Context: Settings and editor features both need one stable wrapper for text-like inputs.
	Responsibility: Define the public API and keep the native-input wrapper details private to the family.
	Boundaries: The family stays presentational and does not validate values, submit forms, or own feature-specific behavior.
-->

# `text-input`

`text-input` provides the shared single-line input primitive for forms and compact control rows.

## Public API

- `TextInput`
- `TextInputProps`
