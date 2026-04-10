import { readThreeTemplateSourceDetails, writeThreeTemplateParameters } from './three-template-source';
import type { EditorLiveResolvedParameter } from './editor-live-layer-types';
import type { ThreeEditorActiveFileContext } from './three-editor-workspace-types';
import type { ThreeTemplateParameterMap } from './three-template-types';

export type EditorLiveCommitParameter = Pick<EditorLiveResolvedParameter, 'key' | 'resolvedValue'>;

export type EditorLiveCommitRequest = {
	content: string;
	path: string;
	parameters: ThreeTemplateParameterMap;
};

/**
 * Converts resolved live-layer values back into a document rewrite request.
 * Missing template metadata remains a supported no-op state.
 */
export function buildEditorLiveCommitRequest(
	context: ThreeEditorActiveFileContext | null,
	parameters: readonly EditorLiveCommitParameter[]
): EditorLiveCommitRequest | null {
	if (!context) {
		return null;
	}

	const templateDetails = readThreeTemplateSourceDetails(context.content);
	const templateHeader = templateDetails.header;
	const templateParameters = templateDetails.parameters;

	if (!templateHeader || !templateParameters) {
		return null;
	}

	const nextParameters = resolveCommittedParameterValues(
		templateHeader.parameters,
		templateParameters,
		parameters
	);

	return {
		content: writeThreeTemplateParameters(context.content, nextParameters),
		parameters: nextParameters,
		path: context.path
	};
}

export function createEditorLiveParameterValueMap(
	parameters: readonly EditorLiveCommitParameter[]
): ThreeTemplateParameterMap {
	return parameters.reduce<ThreeTemplateParameterMap>((result, parameter) => {
		result[parameter.key] = parameter.resolvedValue;
		return result;
	}, {});
}

function resolveCommittedParameterValues(
	definitions: ReadonlyArray<{ defaultValue: EditorLiveCommitParameter['resolvedValue']; key: string }>,
	templateParameters: ThreeTemplateParameterMap,
	parameters: readonly EditorLiveCommitParameter[]
): ThreeTemplateParameterMap {
	const resolvedParameterValues = createEditorLiveParameterValueMap(parameters);

	return definitions.reduce<ThreeTemplateParameterMap>((result, definition) => {
		result[definition.key] = resolvedParameterValues[definition.key] ?? definition.defaultValue;
		return result;
	}, { ...templateParameters });
}
