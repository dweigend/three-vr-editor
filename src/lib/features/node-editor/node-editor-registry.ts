import type { ThreeTemplateParameterDefinition } from '$lib/features/editor/three-template-types';
import type { NodeEditorRegistryEntry } from './node-editor-types';

const nodeEditorRegistry = {
	color: {
		kind: 'color-target'
	},
	range: {
		kind: 'range-target'
	},
	select: {
		kind: 'select-target'
	},
	text: {
		kind: 'text-target'
	}
} as const satisfies Record<ThreeTemplateParameterDefinition['control'], NodeEditorRegistryEntry>;

export function getNodeEditorRegistryEntry(
	control: ThreeTemplateParameterDefinition['control']
): NodeEditorRegistryEntry {
	return nodeEditorRegistry[control];
}
