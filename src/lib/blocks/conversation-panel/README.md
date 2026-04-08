<!--
	Purpose: Describe the reusable conversation-panel block shared by chat-like surfaces.
	Context: The app now needs one transcript-plus-composer layout that works in both the standalone chat route and the editor agent pane.
	Responsibility: Define the shared boundary for message rendering, scrolling, markdown display, and bottom composer placement.
	Boundaries: This block stays presentational and leaves transport, form submission, and feature-specific controls to consuming routes or panels.
-->

# `conversation-panel`

Reusable block family for chat-style transcripts with a persistent composer area.

## Public API

- `ConversationPanel`
- `ConversationMessage`
- `ConversationPanelProps`

## Notes

- Messages render a safe Markdown subset through the shared utility layer.
- The transcript owns scrolling; the composer stays anchored at the bottom of the block.
- Consumers provide the bottom controls through the `composer` snippet.
