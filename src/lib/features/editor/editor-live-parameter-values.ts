import type { EditorLiveResolvedParameter } from './editor-live-layer-types';
import type {
	ThreeTemplateParameterDefinition,
	ThreeTemplateParameterValue
} from './three-template-types';

export function parseEditorLiveParameterValue(
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

export function formatEditorLiveParameterValue(
	definition: ThreeTemplateParameterDefinition,
	value: ThreeTemplateParameterValue
): string {
	if (definition.control !== 'range') {
		return String(value);
	}

	const step = definition.step ?? 0.1;
	const decimalPlaces = countDecimalPlaces(step);

	return Number(value).toFixed(decimalPlaces);
}

export function formatResolvedEditorLiveParameterValue(
	parameter: EditorLiveResolvedParameter
): string {
	return formatEditorLiveParameterValue(parameter.definition, parameter.resolvedValue);
}

export function isEditorLiveHexColor(value: string): boolean {
	return /^#[0-9a-fA-F]{6}$/.test(value);
}

function countDecimalPlaces(value: number): number {
	const normalizedValue = `${value}`;
	const decimalPart = normalizedValue.split('.')[1];

	if (!decimalPart) {
		return 0;
	}

	return Math.min(decimalPart.length, 4);
}
