import type {
	EditorLiveDiscoveryStatus,
	EditorLiveResolvedParameter
} from '$lib/features/editor/editor-live-layer-types';
import { getNodeEditorRegistryEntry } from './node-editor-registry';
import type {
	NodeEditorCanvasEdge,
	NodeEditorCanvasNode,
	NodeEditorCanvasPosition,
	NodeEditorCanvasViewport,
	NodeEditorEmptyState,
	NodeEditorFilterMode,
	NodeEditorPanelModel,
	NodeEditorSourceCanvasNode,
	NodeEditorSourceNode,
	NodeEditorTargetNode
} from './node-editor-types';

type CreateNodeEditorPanelModelOptions = {
	edges: readonly NodeEditorCanvasEdge[];
	filterMode: NodeEditorFilterMode;
	positions: Record<string, NodeEditorCanvasPosition>;
	selectedNodeKey: string | null;
	sourceNodes: readonly NodeEditorSourceNode[];
	viewport: NodeEditorCanvasViewport | null;
};

export function createNodeEditorPanelModel(
	status: EditorLiveDiscoveryStatus,
	parameters: readonly EditorLiveResolvedParameter[],
	options: CreateNodeEditorPanelModelOptions
): NodeEditorPanelModel {
	const nodes = mapNodeEditorTargetNodes(parameters);
	const visibleNodes = filterNodeEditorTargetNodes(nodes, options.filterMode);
	const sourceNodes = [...options.sourceNodes];
	const sourceCanvasNodes = buildNodeEditorSourceCanvasNodes(
		sourceNodes,
		options.positions,
		options.selectedNodeKey
	);

	return {
		canvasEdges: filterNodeEditorCanvasEdges(
			options.edges,
			[
				...visibleNodes.map((node) => `target:${node.key}`),
				...sourceNodes.map((node) => node.key)
			]
		),
		canvasNodes: [
			...sourceCanvasNodes,
			...buildNodeEditorCanvasNodes(visibleNodes, options.positions, options.selectedNodeKey)
		],
		nodes,
		sourceNodes,
		status,
		viewport: options.viewport,
		visibleNodes
	};
}

export function mapNodeEditorTargetNodes(
	parameters: readonly EditorLiveResolvedParameter[]
): NodeEditorTargetNode[] {
	return parameters.map((parameter) => {
		const registryEntry = getNodeEditorRegistryEntry(parameter.definition.control);

		return {
			...parameter,
			kind: registryEntry.kind
		};
	});
}

export function filterNodeEditorTargetNodes(
	nodes: readonly NodeEditorTargetNode[],
	filterMode: NodeEditorFilterMode
): NodeEditorTargetNode[] {
	if (filterMode === 'live') {
		return nodes.filter((node) => node.hasOverride);
	}

	return [...nodes];
}

export function buildNodeEditorCanvasNodes(
	nodes: readonly NodeEditorTargetNode[],
	positions: Record<string, NodeEditorCanvasPosition>,
	selectedNodeKey: string | null
): NodeEditorCanvasNode[] {
	return nodes.map((node, index) => ({
		hasOverride: node.hasOverride,
		id: `target:${node.key}`,
		nodeKey: node.key,
		nodeType: 'target',
		position: positions[node.key] ?? createNodeEditorAutoPosition(index),
		selected: selectedNodeKey === node.key,
		target: node
	}));
}

export function buildNodeEditorSourceCanvasNodes(
	sourceNodes: readonly NodeEditorSourceNode[],
	positions: Record<string, NodeEditorCanvasPosition>,
	selectedNodeKey: string | null
): NodeEditorSourceCanvasNode[] {
	return sourceNodes.map((sourceNode, index) => ({
		hasOverride: false,
		id: sourceNode.key,
		nodeKey: sourceNode.key,
		nodeType: sourceNode.kind,
		position: positions[sourceNode.key] ?? createNodeEditorSourceAutoPosition(index),
		selected: selectedNodeKey === sourceNode.key,
		source: sourceNode
	}));
}

export function mergeNodeEditorCanvasPositions(
	nodes: readonly NodeEditorTargetNode[],
	sourceNodes: readonly NodeEditorSourceNode[],
	positions: Record<string, NodeEditorCanvasPosition>
): Record<string, NodeEditorCanvasPosition> {
	const nextPositions = nodes.reduce<Record<string, NodeEditorCanvasPosition>>((result, node, index) => {
		result[node.key] = positions[node.key] ?? createNodeEditorAutoPosition(index);
		return result;
	}, {});

	for (const [index, sourceNode] of sourceNodes.entries()) {
		nextPositions[sourceNode.key] =
			positions[sourceNode.key] ?? createNodeEditorSourceAutoPosition(index);
	}

	return nextPositions;
}

export function readNodeEditorEmptyState(
	status: EditorLiveDiscoveryStatus,
	activeFileName?: string | null
): NodeEditorEmptyState {
	if (status === 'missing-template-header') {
		return {
			description: activeFileName
				? `${activeFileName} has no template metadata for node targets.`
				: 'Open a file with template metadata to map editable target nodes.',
			title: 'No target nodes'
		};
	}

	if (status === 'missing-parameter-block') {
		return {
			description:
				'The active template declares UI metadata but no editable parameter block yet.',
			title: 'Parameters unavailable'
		};
	}

	if (status === 'no-editable-parameters') {
		return {
			description:
				'The active template is valid but does not expose any editable values.',
			title: 'Nothing to map'
		};
	}

	return {
		description: 'Editable parameters appear here as target nodes.',
		title: 'Targets ready'
	};
}

export function readNodeEditorFilterEmptyState(
	filterMode: NodeEditorFilterMode
): NodeEditorEmptyState {
	if (filterMode === 'live') {
		return {
			description: 'Adjust a target node to narrow the list to active live overrides.',
			title: 'No live overrides'
		};
	}

	return {
		description: 'The active file does not expose any target nodes yet.',
		title: 'No target nodes'
	};
}

function createNodeEditorAutoPosition(index: number): NodeEditorCanvasPosition {
	const columnCount = 2;
	const columnIndex = index % columnCount;
	const rowIndex = Math.floor(index / columnCount);

	return {
		x: columnIndex * 300,
		y: rowIndex * 180
	};
}

function createNodeEditorSourceAutoPosition(index: number): NodeEditorCanvasPosition {
	return {
		x: -320,
		y: index * 180
	};
}

function filterNodeEditorCanvasEdges(
	edges: readonly NodeEditorCanvasEdge[],
	visibleNodeIds: readonly string[]
): NodeEditorCanvasEdge[] {
	const visibleNodeIdSet = new Set(visibleNodeIds);

	return (edges ?? []).filter(
		(edge) => visibleNodeIdSet.has(edge.source) && visibleNodeIdSet.has(edge.target)
	);
}
