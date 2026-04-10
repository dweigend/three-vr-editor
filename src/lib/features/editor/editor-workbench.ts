export const editorWorkbenchPanels = [
	{
		key: 'controls',
		label: 'Controls',
		panelId: 'editor-controls-panel'
	},
	{
		key: 'preview',
		label: 'Preview',
		panelId: 'editor-preview-panel'
	},
	{
		key: 'code',
		label: 'Code',
		panelId: 'editor-code-panel'
	},
	{
		key: 'node-editor',
		label: 'Node Editor',
		panelId: 'editor-node-panel'
	},
	{
		key: 'agent',
		label: 'AI',
		panelId: 'editor-agent-panel'
	}
] as const;

export type EditorWorkbenchPanelKey = (typeof editorWorkbenchPanels)[number]['key'];

export const editorWorkbenchPanelKeys = editorWorkbenchPanels.map((panel) => panel.key);

export const defaultEditorWorkbenchVisibility: EditorWorkbenchPanelKey[] = [
	'preview',
	'code',
	'agent'
];

export function normalizeWorkbenchVisibility(
	visibility: readonly EditorWorkbenchPanelKey[]
): EditorWorkbenchPanelKey[] {
	const visiblePanels = new Set(visibility);
	return editorWorkbenchPanelKeys.filter((panelKey) => visiblePanels.has(panelKey));
}
