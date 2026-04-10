import type { EditorLiveDiscoveryStatus } from '$lib/features/editor/editor-live-layer-types';

type ControlPanelEmptyState = {
	description: string;
	title: string;
};

export function readControlPanelEmptyState(
	status: EditorLiveDiscoveryStatus,
	activeFileName?: string | null
): ControlPanelEmptyState {
	if (status === 'missing-template-header') {
		return {
			description: activeFileName
				? `${activeFileName} has no template control metadata.`
				: 'Open a file with template metadata to expose editable values.',
			title: 'No controls'
		};
	}

	if (status === 'missing-parameter-block') {
		return {
			description:
				'The active template defines UI metadata but no editable parameter block yet.',
			title: 'Parameters unavailable'
		};
	}

	if (status === 'no-editable-parameters') {
		return {
			description:
				'The active template is valid but does not expose any editable values.',
			title: 'Nothing to edit'
		};
	}

	return {
		description: 'Live values become available here as soon as the active file exposes them.',
		title: 'Controls ready'
	};
}
