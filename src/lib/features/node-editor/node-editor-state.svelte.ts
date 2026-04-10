import {
	filterNodeEditorTargetNodes,
	mergeNodeEditorCanvasPositions
} from './node-editor-mapper';
import type {
	NodeEditorCanvasConnection,
	NodeEditorCanvasEdge,
	NodeEditorCanvasPosition,
	NodeEditorCanvasViewport,
	NodeEditorFilterMode,
	NodeEditorSourceNode,
	NodeEditorTargetNode
} from './node-editor-types';

export type NodeEditorState = {
	readonly activePath: string | null;
	readonly currentEdges: NodeEditorCanvasEdge[];
	readonly currentPositions: Record<string, NodeEditorCanvasPosition>;
	readonly currentSourceNodes: NodeEditorSourceNode[];
	readonly selectedNode: NodeEditorTargetNode | null;
	readonly selectedNodeKey: string | null;
	readonly visibleNodes: NodeEditorTargetNode[];
	readonly viewport: NodeEditorCanvasViewport | null;
	connectNodes(connection: NodeEditorCanvasConnection): void;
	filterMode: NodeEditorFilterMode;
	reset(): void;
	setSourceNodeNormalizedValue(key: string, value: number): void;
	setSourceNodeSpeed(key: string, speed: number): void;
	selectNode(key: string): void;
	setNodePosition(key: string, position: NodeEditorCanvasPosition): void;
	sync(path: string | null, nodes: readonly NodeEditorTargetNode[]): void;
	syncViewport(viewport: NodeEditorCanvasViewport): void;
};

export function createNodeEditorState(): NodeEditorState {
	let activePath = $state<string | null>(null);
	let edgesByPath = $state<Record<string, NodeEditorCanvasEdge[]>>({});
	let filterMode = $state<NodeEditorFilterMode>('all');
	let nodes = $state<NodeEditorTargetNode[]>([]);
	let positionsByPath = $state<Record<string, Record<string, NodeEditorCanvasPosition>>>({});
	let selectedNodeKey = $state<string | null>(null);
	let sourceNodesByPath = $state<Record<string, NodeEditorSourceNode[]>>({});
	let viewportsByPath = $state<Record<string, NodeEditorCanvasViewport>>({});

	const visibleNodes = $derived(filterNodeEditorTargetNodes(nodes, filterMode));
	const selectedNode = $derived.by<NodeEditorTargetNode | null>(() => {
		if (!selectedNodeKey) {
			return visibleNodes[0] ?? null;
		}

		return visibleNodes.find((node) => node.key === selectedNodeKey) ?? visibleNodes[0] ?? null;
	});
	const currentPositions = $derived.by<Record<string, NodeEditorCanvasPosition>>(() => {
		if (!activePath) {
			return {};
		}

		return positionsByPath[activePath] ?? {};
	});
	const currentEdges = $derived.by<NodeEditorCanvasEdge[]>(() => {
		if (!activePath) {
			return [];
		}

		return edgesByPath[activePath] ?? [];
	});
	const currentSourceNodes = $derived.by<NodeEditorSourceNode[]>(() => {
		if (!activePath) {
			return [];
		}

		return sourceNodesByPath[activePath] ?? [];
	});
	const viewport = $derived.by<NodeEditorCanvasViewport | null>(() => {
		if (!activePath) {
			return null;
		}

		return viewportsByPath[activePath] ?? null;
	});

	function sync(path: string | null, nextNodes: readonly NodeEditorTargetNode[]): void {
		const nextPath = path ?? null;

		if (nextPath) {
			const existingPositions = positionsByPath[nextPath] ?? {};
			const existingSourceNodes = sourceNodesByPath[nextPath] ?? [];
			const nextSourceNodes = mergeNodeEditorSourceNodes(existingSourceNodes);
			const nextPositions = mergeNodeEditorCanvasPositions(
				nextNodes,
				nextSourceNodes,
				existingPositions
			);
			const existingEdges = edgesByPath[nextPath] ?? [];
			const nextEdges = pruneNodeEditorCanvasEdges(nextNodes, nextSourceNodes, existingEdges);

			if (!arePositionMapsEquivalent(existingPositions, nextPositions)) {
				positionsByPath = {
					...positionsByPath,
					[nextPath]: nextPositions
				};
			}

			if (!areSourceNodeListsEquivalent(existingSourceNodes, nextSourceNodes)) {
				sourceNodesByPath = {
					...sourceNodesByPath,
					[nextPath]: nextSourceNodes
				};
			}

			if (!areEdgeListsEquivalent(existingEdges, nextEdges)) {
				edgesByPath = {
					...edgesByPath,
					[nextPath]: nextEdges
				};
			}
		}

		activePath = nextPath;

		if (areNodeListsEquivalent(nodes, nextNodes)) {
			reconcileSelection(nextNodes);
			return;
		}

		nodes = [...nextNodes];
		reconcileSelection(nextNodes);
	}

	function selectNode(key: string): void {
		selectedNodeKey = key;
	}

	function connectNodes(connection: NodeEditorCanvasConnection): void {
		if (!activePath || connection.source === connection.target) {
			return;
		}

		const sourceNode = (sourceNodesByPath[activePath] ?? []).find(
			(node) => node.key === connection.source
		);
		const targetKey = connection.target.replace(/^target:/, '');
		const targetNode = nodes.find((node) => node.key === targetKey);

		if (
			!sourceNode ||
			!targetNode ||
			targetNode.definition.control !== 'range' ||
			!connection.source.startsWith('source:') ||
			!connection.target.startsWith('target:')
		) {
			return;
		}

		const nextEdge = createNodeEditorCanvasEdge(connection);
		const currentPathEdges = (edgesByPath[activePath] ?? []).filter(
			(edge) => edge.target !== connection.target
		);

		if (currentPathEdges.some((edge) => edge.id === nextEdge.id)) {
			return;
		}

		edgesByPath = {
			...edgesByPath,
			[activePath]: [...currentPathEdges, nextEdge]
		};
	}

	function reset(): void {
		activePath = null;
		edgesByPath = {};
		filterMode = 'all';
		nodes = [];
		positionsByPath = {};
		selectedNodeKey = null;
		sourceNodesByPath = {};
		viewportsByPath = {};
	}

	function setSourceNodeNormalizedValue(key: string, value: number): void {
		updateSourceNodes((node) =>
			node.key === key
				? {
						...node,
						normalizedValue: clampNodeEditorNormalizedValue(value)
					}
				: node
		);
	}

	function setSourceNodeSpeed(key: string, speed: number): void {
		updateSourceNodes((node) =>
			node.key === key
				? {
						...node,
						speed: clampNodeEditorLfoSpeed(speed)
					}
				: node
		);
	}

	function setNodePosition(key: string, position: NodeEditorCanvasPosition): void {
		if (!activePath) {
			return;
		}

		const nextPathPositions = {
			...(positionsByPath[activePath] ?? {}),
			[key]: position
		};

		if (arePositionMapsEquivalent(positionsByPath[activePath] ?? {}, nextPathPositions)) {
			return;
		}

		positionsByPath = {
			...positionsByPath,
			[activePath]: nextPathPositions
		};
	}

	function syncViewport(nextViewport: NodeEditorCanvasViewport): void {
		if (!activePath) {
			return;
		}

		const currentViewport = viewportsByPath[activePath];

		if (areViewportsEquivalent(currentViewport, nextViewport)) {
			return;
		}

		viewportsByPath = {
			...viewportsByPath,
			[activePath]: nextViewport
		};
	}

	function reconcileSelection(nextNodes: readonly NodeEditorTargetNode[] = nodes): void {
		const nextVisibleNodes = filterNodeEditorTargetNodes(nextNodes, filterMode);

		if (nextVisibleNodes.length === 0) {
			selectedNodeKey = null;
			return;
		}

		if (selectedNodeKey && nextVisibleNodes.some((node) => node.key === selectedNodeKey)) {
			return;
		}

		selectedNodeKey = nextVisibleNodes[0]?.key ?? null;
	}

	return {
		get activePath() {
			return activePath;
		},
		get currentEdges() {
			return currentEdges;
		},
		get currentPositions() {
			return currentPositions;
		},
		get currentSourceNodes() {
			return currentSourceNodes;
		},
		connectNodes,
		get filterMode() {
			return filterMode;
		},
		set filterMode(value: NodeEditorFilterMode) {
			if (filterMode === value) {
				return;
			}

			filterMode = value;
			reconcileSelection();
		},
		get selectedNode() {
			return selectedNode;
		},
		get selectedNodeKey() {
			return selectedNodeKey;
		},
		get visibleNodes() {
			return visibleNodes;
		},
		get viewport() {
			return viewport;
		},
		reset,
		setSourceNodeNormalizedValue,
		setSourceNodeSpeed,
		selectNode,
		setNodePosition,
		sync,
		syncViewport
	};

	function updateSourceNodes(
		mapper: (node: NodeEditorSourceNode) => NodeEditorSourceNode
	): void {
		if (!activePath) {
			return;
		}

		const currentPathSourceNodes = sourceNodesByPath[activePath] ?? [];
		const nextPathSourceNodes = currentPathSourceNodes.map(mapper);

		if (areSourceNodeListsEquivalent(currentPathSourceNodes, nextPathSourceNodes)) {
			return;
		}

		sourceNodesByPath = {
			...sourceNodesByPath,
			[activePath]: nextPathSourceNodes
		};
	}
}

function createNodeEditorCanvasEdge(connection: NodeEditorCanvasConnection): NodeEditorCanvasEdge {
	return {
		...connection,
		id: [
			connection.source,
			connection.sourceHandle ?? 'source',
			connection.target,
			connection.targetHandle ?? 'target'
		].join('->')
	};
}

function pruneNodeEditorCanvasEdges(
	nodes: readonly NodeEditorTargetNode[],
	sourceNodes: readonly NodeEditorSourceNode[],
	edges: readonly NodeEditorCanvasEdge[]
): NodeEditorCanvasEdge[] {
	const validNodeIds = new Set([
		...nodes.map((node) => `target:${node.key}`),
		...sourceNodes.map((node) => node.key)
	]);

	return edges.filter(
		(edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
	);
}

function areEdgeListsEquivalent(
	currentEdges: readonly NodeEditorCanvasEdge[],
	nextEdges: readonly NodeEditorCanvasEdge[]
): boolean {
	if (currentEdges.length !== nextEdges.length) {
		return false;
	}

	return currentEdges.every((currentEdge, index) => {
		const nextEdge = nextEdges[index];

		return (
			currentEdge.id === nextEdge?.id &&
			currentEdge.source === nextEdge.source &&
			currentEdge.sourceHandle === nextEdge.sourceHandle &&
			currentEdge.target === nextEdge.target &&
			currentEdge.targetHandle === nextEdge.targetHandle
		);
	});
}

function areNodeListsEquivalent(
	currentNodes: readonly NodeEditorTargetNode[],
	nextNodes: readonly NodeEditorTargetNode[]
): boolean {
	if (currentNodes.length !== nextNodes.length) {
		return false;
	}

	return currentNodes.every((currentNode, index) => {
		const nextNode = nextNodes[index];

		return (
			currentNode.key === nextNode?.key &&
			currentNode.documentValue === nextNode.documentValue &&
			currentNode.resolvedValue === nextNode.resolvedValue &&
			currentNode.hasOverride === nextNode.hasOverride
		);
	});
}

function arePositionMapsEquivalent(
	currentPositions: Record<string, NodeEditorCanvasPosition>,
	nextPositions: Record<string, NodeEditorCanvasPosition>
): boolean {
	const currentEntries = Object.entries(currentPositions);
	const nextEntries = Object.entries(nextPositions);

	if (currentEntries.length !== nextEntries.length) {
		return false;
	}

	return nextEntries.every(([key, position]) => {
		const currentPosition = currentPositions[key];

		return currentPosition?.x === position.x && currentPosition?.y === position.y;
	});
}

function areViewportsEquivalent(
	currentViewport: NodeEditorCanvasViewport | null | undefined,
	nextViewport: NodeEditorCanvasViewport | null
): boolean {
	if (!currentViewport && !nextViewport) {
		return true;
	}

	if (!currentViewport || !nextViewport) {
		return false;
	}

	return (
		currentViewport.x === nextViewport.x &&
		currentViewport.y === nextViewport.y &&
		currentViewport.zoom === nextViewport.zoom
	);
}

function areSourceNodeListsEquivalent(
	currentNodes: readonly NodeEditorSourceNode[],
	nextNodes: readonly NodeEditorSourceNode[]
): boolean {
	if (currentNodes.length !== nextNodes.length) {
		return false;
	}

	return currentNodes.every((currentNode, index) => {
		const nextNode = nextNodes[index];

		return (
			currentNode.key === nextNode?.key &&
			currentNode.kind === nextNode.kind &&
			currentNode.label === nextNode.label &&
			currentNode.normalizedValue === nextNode.normalizedValue &&
			currentNode.speed === nextNode.speed
		);
	});
}

function mergeNodeEditorSourceNodes(
	currentNodes: readonly NodeEditorSourceNode[]
): NodeEditorSourceNode[] {
	if (currentNodes.length > 0) {
		return [...currentNodes];
	}

	return [
		{
			key: 'source:slider',
			kind: 'slider-source',
			label: 'Slider',
			normalizedValue: 0.5,
			speed: 0
		},
		{
			key: 'source:lfo',
			kind: 'lfo-source',
			label: 'LFO',
			normalizedValue: 0.5,
			speed: 0.2
		}
	];
}

function clampNodeEditorLfoSpeed(value: number): number {
	return Math.min(1.5, Math.max(0.05, value));
}

function clampNodeEditorNormalizedValue(value: number): number {
	return Math.min(1, Math.max(0, value));
}
