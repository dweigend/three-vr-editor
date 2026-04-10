import type {
	EditorLiveDiscoveryStatus,
	EditorLiveResolvedParameter
} from '$lib/features/editor/editor-live-layer-types';
import type {
	ThreeTemplateParameterDefinition,
	ThreeTemplateParameterValue
} from '$lib/features/editor/three-template-types';

type ControlPanelEmptyState = {
	description: string;
	title: string;
};

export function parseControlPanelValue(
	definition: ThreeTemplateParameterDefinition,
	rawValue: string
): ThreeTemplateParameterValue {
	if (definition.control === 'range') {
		const parsedValue = Number.parseFloat(rawValue);
		return Number.isFinite(parsedValue) ? parsedValue : definition.defaultValue;
	}

	if (definition.control === 'select') {
		return definition.options.find((option) => String(option.value) === rawValue)?.value ?? definition.defaultValue;
	}

	return rawValue;
}

export function formatControlPanelValue(parameter: EditorLiveResolvedParameter): string {
	if (parameter.definition.control !== 'range') {
		return String(parameter.resolvedValue);
	}

	const step = parameter.definition.step ?? 0.1;
	const decimalPlaces = countDecimalPlaces(step);

	return Number(parameter.resolvedValue).toFixed(decimalPlaces);
}

export function isControlPanelHexColor(value: string): boolean {
	return /^#[0-9a-fA-F]{6}$/.test(value);
}

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

function countDecimalPlaces(value: number): number {
	const normalizedValue = `${value}`;
	const decimalPart = normalizedValue.split('.')[1];

	if (!decimalPart) {
		return 0;
	}

	return Math.min(decimalPart.length, 4);
}
