<script lang="ts">
	import { untrack } from 'svelte';
	import {
		addEdge,
		Background,
		BackgroundVariant,
		SvelteFlow,
		type Connection,
		type Edge as SvelteFlowEdge,
		type Node as SvelteFlowNode,
		type NodeTypes,
		type Viewport
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import type { ThreeTemplateParameterValue } from '$lib/features/editor/three-template-types';
	import type {
		NodeEditorCanvasConnection,
		NodeEditorCanvasEdge,
		NodeEditorCanvasNode,
		NodeEditorCanvasPosition,
		NodeEditorCanvasViewport,
		NodeEditorSourceNode,
		NodeEditorTargetNode
	} from '../node-editor-types';
	import NodeEditorCanvasSourceNode from './NodeEditorCanvasSourceNode.svelte';
	import NodeEditorCanvasTargetNode from './NodeEditorCanvasTargetNode.svelte';

	type FlowTargetNodeData = {
		onResetLive?: ((key: string) => void) | undefined;
		onValueChange?: ((key: string, value: ThreeTemplateParameterValue) => void) | undefined;
		target: NodeEditorTargetNode;
	};

	type FlowSourceNodeData = {
		onSourceNodeNormalizedValueChange?: ((key: string, value: number) => void) | undefined;
		onSourceNodeSpeedChange?: ((key: string, speed: number) => void) | undefined;
		source: NodeEditorSourceNode;
	};

	type FlowNode =
		| SvelteFlowNode<FlowTargetNodeData, 'target'>
		| SvelteFlowNode<FlowSourceNodeData, 'slider-source'>
		| SvelteFlowNode<FlowSourceNodeData, 'lfo-source'>;
	type FlowEdge = SvelteFlowEdge<Record<string, never>, 'smoothstep'>;

	type Props = {
		edges?: readonly NodeEditorCanvasEdge[];
		nodes: readonly NodeEditorCanvasNode[];
		onConnect?: ((connection: NodeEditorCanvasConnection) => void) | undefined;
		onNodePositionChange?: ((key: string, position: NodeEditorCanvasPosition) => void) | undefined;
		onNodeSelect?: ((key: string) => void) | undefined;
		onResetLive?: ((key: string) => void) | undefined;
		onSourceNodeNormalizedValueChange?: ((key: string, value: number) => void) | undefined;
		onSourceNodeSpeedChange?: ((key: string, speed: number) => void) | undefined;
		onValueChange?: ((key: string, value: ThreeTemplateParameterValue) => void) | undefined;
		onViewportChange?: ((viewport: NodeEditorCanvasViewport) => void) | undefined;
		viewport?: NodeEditorCanvasViewport | null;
	};

	const nodeTypes = {
		'lfo-source': NodeEditorCanvasSourceNode,
		'slider-source': NodeEditorCanvasSourceNode,
		target: NodeEditorCanvasTargetNode
	} satisfies NodeTypes;

	let {
		edges = [],
		nodes,
		onConnect,
		onNodePositionChange,
		onNodeSelect,
		onResetLive,
		onSourceNodeNormalizedValueChange,
		onSourceNodeSpeedChange,
		onValueChange,
		onViewportChange,
		viewport = null
	}: Props = $props();

	let flowNodes = $state.raw<FlowNode[]>([]);
	let flowEdges = $state.raw<FlowEdge[]>([]);
	let flowViewport = $state<Viewport | undefined>(undefined);

	const shouldFitView = $derived(viewport === null);

	$effect(() => {
		const nextNodes = nodes.map((node) =>
			createSvelteFlowNode(
				node,
				onResetLive,
				onSourceNodeNormalizedValueChange,
				onSourceNodeSpeedChange,
				onValueChange
			)
		);
		const hasSameNodes = untrack(() => areSvelteFlowNodesEquivalent(flowNodes, nextNodes));

		if (!hasSameNodes) {
			flowNodes = nextNodes;
		}
	});

	$effect(() => {
		const nextEdges = edges.map(createSvelteFlowEdge);
		const hasSameEdges = untrack(() => areSvelteFlowEdgesEquivalent(flowEdges, nextEdges));

		if (!hasSameEdges) {
			flowEdges = nextEdges;
		}
	});

	$effect(() => {
		const nextViewport = viewport ?? undefined;
		const hasSameViewport = untrack(() => areViewportsEquivalent(flowViewport, nextViewport));

		if (!hasSameViewport) {
			flowViewport = nextViewport;
		}
	});

	function handleConnect(connection: Connection): void {
		if (!connection.source || !connection.target) {
			return;
		}

		const nextConnection = {
			source: connection.source,
			sourceHandle: connection.sourceHandle ?? null,
			target: connection.target,
			targetHandle: connection.targetHandle ?? null
		} satisfies NodeEditorCanvasConnection;

		flowEdges = addEdge(createSvelteFlowEdge(createCanvasEdge(nextConnection)), flowEdges);
		onConnect?.(nextConnection);
	}

	function handleMoveEnd(_event: MouseEvent | TouchEvent | null, nextViewport: Viewport): void {
		onViewportChange?.(nextViewport);
	}

	function handleNodeClick({ node }: { node: FlowNode }): void {
		if ('target' in node.data) {
			onNodeSelect?.(node.data.target.key);
			return;
		}

		onNodeSelect?.(node.data.source.key);
	}

	function handleNodeDragStop({ targetNode }: { targetNode: FlowNode | null }): void {
		if (!targetNode) {
			return;
		}

		if ('target' in targetNode.data) {
			onNodePositionChange?.(targetNode.data.target.key, targetNode.position);
			return;
		}

		onNodePositionChange?.(targetNode.data.source.key, targetNode.position);
	}

	function createCanvasEdge(connection: NodeEditorCanvasConnection): NodeEditorCanvasEdge {
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

	function createSvelteFlowEdge(edge: NodeEditorCanvasEdge): FlowEdge {
		return {
			animated: false,
			data: {},
			id: edge.id,
			source: edge.source,
			sourceHandle: edge.sourceHandle ?? undefined,
			target: edge.target,
			targetHandle: edge.targetHandle ?? undefined,
			type: 'smoothstep'
		};
	}

	function createSvelteFlowNode(
		node: NodeEditorCanvasNode,
		handleResetLive: Props['onResetLive'],
		handleSourceNodeNormalizedValueChange: Props['onSourceNodeNormalizedValueChange'],
		handleSourceNodeSpeedChange: Props['onSourceNodeSpeedChange'],
		handleValueChange: Props['onValueChange']
	): FlowNode {
		if ('source' in node) {
			return {
				data: {
					onSourceNodeNormalizedValueChange: handleSourceNodeNormalizedValueChange,
					onSourceNodeSpeedChange: handleSourceNodeSpeedChange,
					source: node.source
				},
				deletable: false,
				draggable: true,
				id: node.id,
				position: node.position,
				selectable: true,
				selected: node.selected,
				type: node.nodeType
			};
		}

		return {
			data: {
				onResetLive: handleResetLive,
				onValueChange: handleValueChange,
				target: node.target
			},
			deletable: false,
			draggable: true,
			id: node.id,
			position: node.position,
			selectable: true,
			selected: node.selected,
			type: node.nodeType
		};
	}

	function areSvelteFlowEdgesEquivalent(
		currentEdges: readonly FlowEdge[],
		nextEdges: readonly FlowEdge[]
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

	function areSvelteFlowNodesEquivalent(
		currentNodes: readonly FlowNode[],
		nextNodes: readonly FlowNode[]
	): boolean {
		if (currentNodes.length !== nextNodes.length) {
			return false;
		}

		return currentNodes.every((currentNode, index) => {
			const nextNode = nextNodes[index];

			if (
				currentNode.id !== nextNode?.id ||
				currentNode.position.x !== nextNode.position.x ||
				currentNode.position.y !== nextNode.position.y ||
				currentNode.selected !== nextNode.selected
			) {
				return false;
			}

			if ('target' in currentNode.data && 'target' in nextNode.data) {
				return (
					currentNode.data.target.key === nextNode.data.target.key &&
					currentNode.data.target.kind === nextNode.data.target.kind &&
					currentNode.data.target.resolvedValue === nextNode.data.target.resolvedValue &&
					currentNode.data.target.hasOverride === nextNode.data.target.hasOverride
				);
			}

			if ('source' in currentNode.data && 'source' in nextNode.data) {
				return (
					currentNode.data.source.key === nextNode.data.source.key &&
					currentNode.data.source.kind === nextNode.data.source.kind &&
					currentNode.data.source.normalizedValue === nextNode.data.source.normalizedValue &&
					currentNode.data.source.speed === nextNode.data.source.speed
				);
			}

			return false;
		});
	}

	function areViewportsEquivalent(
		currentViewport: Viewport | undefined,
		nextViewport: Viewport | undefined
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
</script>

<div class="node-editor__canvas-shell">
	<SvelteFlow
		bind:edges={flowEdges}
		bind:nodes={flowNodes}
		bind:viewport={flowViewport}
		class="node-editor__flow"
		defaultEdgeOptions={{ type: 'smoothstep' }}
		elementsSelectable={true}
		fitView={shouldFitView}
		fitViewOptions={{ padding: 0.2 }}
		maxZoom={1.4}
		minZoom={0.45}
		nodesConnectable={true}
		nodesDraggable={true}
		nodesFocusable={true}
		panOnScroll={false}
		proOptions={{ hideAttribution: true }}
		selectionOnDrag={false}
		{nodeTypes}
		onconnect={handleConnect}
		onmoveend={handleMoveEnd}
		onnodeclick={handleNodeClick}
		onnodedragstop={handleNodeDragStop}
	>
		<Background gap={20} size={1} variant={BackgroundVariant.Dots} />
	</SvelteFlow>
</div>
