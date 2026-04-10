import type {
	EditorLiveDiscoveryStatus,
	EditorLiveResolvedParameter
} from '$lib/features/editor/editor-live-layer-types';

export type NodeEditorFilterMode = 'all' | 'live';

export type NodeEditorTargetNodeKind =
	| 'range-target'
	| 'color-target'
	| 'select-target'
	| 'text-target';

export type NodeEditorSourceNodeKind = 'slider-source' | 'lfo-source';

export type NodeEditorRegistryEntry = {
	kind: NodeEditorTargetNodeKind;
};

export type NodeEditorTargetNode = EditorLiveResolvedParameter & {
	kind: NodeEditorTargetNodeKind;
};

export type NodeEditorSourceNode = {
	key: string;
	kind: NodeEditorSourceNodeKind;
	label: string;
	normalizedValue: number;
	speed: number;
};

export type NodeEditorCanvasNodeType = 'target' | 'slider-source' | 'lfo-source';

export type NodeEditorCanvasPosition = {
	x: number;
	y: number;
};

export type NodeEditorCanvasViewport = {
	x: number;
	y: number;
	zoom: number;
};

export type NodeEditorTargetCanvasNode = {
	hasOverride: boolean;
	id: string;
	nodeKey: string;
	nodeType: 'target';
	position: NodeEditorCanvasPosition;
	selected: boolean;
	target: NodeEditorTargetNode;
};

export type NodeEditorSourceCanvasNode = {
	hasOverride: false;
	id: string;
	nodeKey: string;
	nodeType: NodeEditorSourceNodeKind;
	position: NodeEditorCanvasPosition;
	selected: boolean;
	source: NodeEditorSourceNode;
};

export type NodeEditorCanvasNode = NodeEditorTargetCanvasNode | NodeEditorSourceCanvasNode;

export type NodeEditorCanvasConnection = {
	source: string;
	sourceHandle: string | null;
	target: string;
	targetHandle: string | null;
};

export type NodeEditorCanvasEdge = NodeEditorCanvasConnection & {
	id: string;
};

export type NodeEditorEmptyState = {
	description: string;
	title: string;
};

export type NodeEditorPanelModel = {
	canvasEdges: NodeEditorCanvasEdge[];
	canvasNodes: NodeEditorCanvasNode[];
	nodes: NodeEditorTargetNode[];
	sourceNodes: NodeEditorSourceNode[];
	status: EditorLiveDiscoveryStatus;
	viewport: NodeEditorCanvasViewport | null;
	visibleNodes: NodeEditorTargetNode[];
};
