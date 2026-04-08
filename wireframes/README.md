<!--
	Purpose: Preserve the current layout wireframes that drive the square-shell cleanup work.
	Context: The screenshots in this folder are the shared visual reference for the app shell, menu, editor, settings, and chat layouts.
	Responsibility: Name the stored wireframes clearly and explain how they map to the current screen architecture.
	Boundaries: This folder is a design reference only and does not define implementation details by itself.
-->

# `wireframes`

This folder holds the layout wireframes used for the current UI cleanup pass.

## Files

- `hauptstruktur.png`
  Main shell frame with left home cell and right menu toggle.
- `editor.png`
  Editor workbench with code top-left, Pi agent bottom-left, and Three preview on the right.
- `geoeffnetes-menue.png`
  Open right-side navigation panel for settings, editor, and chat.
- `settings.png`
  Stacked settings surfaces for keys and models.
- `chat.png`
  Chat transcript with a bottom composer.

## How They Map To Code

- Global shell and menu: `src/routes/+layout.svelte` and `src/app.css`
- Editor workbenches: `src/lib/three/ThreeEditorWorkspace.svelte` and `src/lib/three/ThreeEditorAgentWorkbench.svelte`
- Settings screens: `src/routes/demo/pi/+page.svelte` and `src/routes/demo/pi/models/+page.svelte`
- Chat screen: `src/routes/demo/pi/chat/+page.svelte`
