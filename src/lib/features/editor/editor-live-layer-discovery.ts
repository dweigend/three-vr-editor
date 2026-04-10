import type { ThreeEditorActiveFileContext } from './three-editor-workspace-types';
import type {
	EditorLiveDiscoveryResult,
	EditorLiveDiscoveryStatus,
	EditorLiveEditableParameter
} from './editor-live-layer-types';
import { readThreeTemplateSourceDetails } from './three-template-source';
import type {
	ThreeTemplateParameterDefinition,
	ThreeTemplateHeader,
	ThreeTemplateParameterMap,
	ThreeTemplateParameterValue
} from './three-template-types';

/**
 * Discovers the current file's live-editable parameters from template metadata.
 * Missing metadata and empty parameter sets are treated as valid empty states.
 */
export function discoverEditorLiveParameters(
	context: ThreeEditorActiveFileContext | null
): EditorLiveDiscoveryResult {
	if (!context) {
		return createEmptyEditorLiveDiscoveryResult(null, 'missing-template-header');
	}

	const templateDetails = readThreeTemplateSourceDetails(context.content);
	const templateHeader = templateDetails.header;
	const templateParameters = templateDetails.parameters;

	if (!templateHeader) {
		return createEmptyEditorLiveDiscoveryResult(context.path, 'missing-template-header');
	}

	if (!templateParameters) {
		return createEmptyEditorLiveDiscoveryResult(context.path, 'missing-parameter-block', templateHeader);
	}

	if (templateHeader.parameters.length === 0) {
		return createEmptyEditorLiveDiscoveryResult(context.path, 'no-editable-parameters', templateHeader);
	}

	const editableParameters = templateHeader.parameters.map((definition) =>
		createEditorLiveEditableParameter(definition, templateParameters)
	);
	const documentValues = editableParameters.reduce<ThreeTemplateParameterMap>((result, parameter) => {
		result[parameter.key] = parameter.documentValue;
		return result;
	}, {});

	return {
		documentValues,
		editableParameters,
		path: context.path,
		status: 'ready',
		template: templateHeader
	};
}

export function createEmptyEditorLiveDiscoveryResult(
	path: string | null,
	status: EditorLiveDiscoveryStatus,
	template: ThreeTemplateHeader | null = null
): EditorLiveDiscoveryResult {
	return {
		documentValues: {},
		editableParameters: [],
		path,
		status,
		template
	};
}

function createEditorLiveEditableParameter(
	definition: ThreeTemplateParameterDefinition,
	documentValues: ThreeTemplateParameterMap
): EditorLiveEditableParameter {
	const documentValue = readDocumentValue(definition, documentValues);

	return {
		defaultValue: definition.defaultValue,
		definition,
		documentValue,
		key: definition.key
	};
}

function readDocumentValue(
	definition: ThreeTemplateParameterDefinition,
	documentValues: ThreeTemplateParameterMap
): ThreeTemplateParameterValue {
	return documentValues[definition.key] ?? definition.defaultValue;
}
