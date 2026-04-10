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
- Editor workspace: `src/routes/editor/+page.svelte`
- Settings screen: `src/routes/settings/+page.svelte`
- Chat screen: `src/routes/chat/+page.svelte`
