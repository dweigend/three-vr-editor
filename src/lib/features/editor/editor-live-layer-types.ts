import type {
	ThreeTemplateParameterDefinition,
	ThreeTemplateParameterMap,
	ThreeTemplateParameterValue
} from './three-template-types';

export type EditorLiveLayerConsumer = 'node-editor' | 'control-panel';

export type EditorLiveLayerMode = 'idle' | 'active';

export type EditorLiveDiscoveryStatus =
	| 'missing-template-header'
	| 'missing-parameter-block'
	| 'no-editable-parameters'
	| 'ready';

export type EditorLiveEditableParameter = {
	defaultValue: ThreeTemplateParameterValue;
	definition: ThreeTemplateParameterDefinition;
	documentValue: ThreeTemplateParameterValue;
	key: string;
};

export type EditorLiveResolvedParameter = EditorLiveEditableParameter & {
	hasOverride: boolean;
	overrideValue: ThreeTemplateParameterValue | null;
	resolvedValue: ThreeTemplateParameterValue;
};

export type EditorLiveDiscoveryResult = {
	documentValues: ThreeTemplateParameterMap;
	editableParameters: EditorLiveEditableParameter[];
	path: string | null;
	status: EditorLiveDiscoveryStatus;
};

export type EditorLiveOverrideMap = Record<string, ThreeTemplateParameterValue>;
