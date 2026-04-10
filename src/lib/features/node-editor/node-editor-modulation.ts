import type {
	ThreeTemplateParameterDefinition,
	ThreeTemplateRangeParameterDefinition
} from '$lib/features/editor/three-template-types';
import type {
	NodeEditorCanvasEdge,
	NodeEditorSourceNode,
	NodeEditorTargetNode
} from './node-editor-types';

export type NodeEditorModulationOverride = {
	key: string;
	value: number;
};

export type NodeEditorModulationFrame = {
	hasAnimatedSources: boolean;
	overrides: NodeEditorModulationOverride[];
};

type NodeEditorModulationTarget = Pick<NodeEditorTargetNode, 'definition' | 'key'>;

export function createNodeEditorModulationFrame(
	edges: readonly NodeEditorCanvasEdge[],
	sourceNodes: readonly NodeEditorSourceNode[],
	targetNodes: readonly NodeEditorModulationTarget[],
	timeSeconds: number
): NodeEditorModulationFrame {
	const overridesByKey = new Map<string, number>();
	const sourceByKey = new Map(sourceNodes.map((sourceNode) => [sourceNode.key, sourceNode]));
	const rangeTargetById = new Map<string, NodeEditorModulationTarget & {
		definition: ThreeTemplateRangeParameterDefinition;
	}>(
		targetNodes
			.filter(isNodeEditorRangeTarget)
			.map((targetNode) => [`target:${targetNode.key}`, targetNode] as const)
	);

	let hasAnimatedSources = false;

	for (const edge of edges) {
		const sourceNode = sourceByKey.get(edge.source);
		const targetNode = rangeTargetById.get(edge.target);

		if (!sourceNode || !targetNode) {
			continue;
		}

		if (sourceNode.kind === 'lfo-source') {
			hasAnimatedSources = true;
		}

		overridesByKey.set(
			targetNode.key,
			mapNormalizedValueToRange(
				readNodeEditorSourceOutputNormalized(sourceNode, timeSeconds),
				targetNode.definition
			)
		);
	}

	return {
		hasAnimatedSources,
		overrides: Array.from(overridesByKey, ([key, value]) => ({
			key,
			value
		}))
	};
}

function readNodeEditorSourceOutputNormalized(
	sourceNode: NodeEditorSourceNode,
	timeSeconds: number
): number {
	if (sourceNode.kind === 'slider-source') {
		return clampNormalizedValue(sourceNode.normalizedValue);
	}

	return clampNormalizedValue((Math.sin(timeSeconds * sourceNode.speed * Math.PI * 2) + 1) / 2);
}

function mapNormalizedValueToRange(
	normalizedValue: number,
	definition: ThreeTemplateRangeParameterDefinition
): number {
	const clampedNormalizedValue = clampNormalizedValue(normalizedValue);
	const rawValue = definition.min + clampedNormalizedValue * (definition.max - definition.min);

	if (definition.step === undefined) {
		return roundNodeEditorNumber(rawValue);
	}

	const stepCount = Math.round((rawValue - definition.min) / definition.step);
	const steppedValue = definition.min + stepCount * definition.step;

	return roundNodeEditorNumber(
		Math.min(definition.max, Math.max(definition.min, steppedValue))
	);
}

function clampNormalizedValue(value: number): number {
	return Math.min(1, Math.max(0, value));
}

function roundNodeEditorNumber(value: number): number {
	return Number(value.toFixed(6));
}

function isNodeEditorRangeTarget(
	targetNode: NodeEditorModulationTarget
): targetNode is NodeEditorModulationTarget & {
	definition: ThreeTemplateRangeParameterDefinition;
} {
	return isRangeParameterDefinition(targetNode.definition);
}

function isRangeParameterDefinition(
	definition: ThreeTemplateParameterDefinition
): definition is ThreeTemplateRangeParameterDefinition {
	return definition.control === 'range';
}
