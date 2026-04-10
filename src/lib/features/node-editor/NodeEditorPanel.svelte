<script lang="ts">
	import { untrack } from 'svelte';
	import CheckCheck from '@lucide/svelte/icons/check-check';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	import { Badge, Button, ToggleGroup } from '$lib/components';
	import { editorLiveLayer } from '$lib/features/editor/editor-live-layer.svelte';
	import type { ThreeTemplateParameterValue } from '$lib/features/editor/three-template-types';
	import {
		createNodeEditorPanelModel,
		readNodeEditorEmptyState,
		readNodeEditorFilterEmptyState
	} from './node-editor-mapper';
	import { createNodeEditorModulationFrame } from './node-editor-modulation';
	import { createNodeEditorState } from './node-editor-state.svelte';
	import NodeEditorCanvas from './render/NodeEditorCanvas.svelte';

	type Props = {
		activeFileName?: string | null;
		onApply?: (() => void) | undefined;
		panelId: string;
	};

	const filterOptions = [
		{ label: 'All', value: 'all' },
		{ label: 'Live', value: 'live' }
	] as const;

const nodeEditorState = createNodeEditorState();
const modulatedTargetValues = new Map<string, number>();

let { activeFileName = null, onApply, panelId }: Props = $props();

	const panelModel = $derived.by(() =>
		createNodeEditorPanelModel(editorLiveLayer.discovery.status, editorLiveLayer.resolvedParameters, {
			edges: nodeEditorState.currentEdges ?? [],
			filterMode: nodeEditorState.filterMode,
			positions: nodeEditorState.currentPositions,
			selectedNodeKey: nodeEditorState.selectedNodeKey,
			sourceNodes: nodeEditorState.currentSourceNodes ?? [],
			viewport: nodeEditorState.viewport
		})
	);
	const emptyState = $derived(readNodeEditorEmptyState(panelModel.status, activeFileName));
	const filterEmptyState = $derived(readNodeEditorFilterEmptyState(nodeEditorState.filterMode));
	const hasReadyNodes = $derived(panelModel.status === 'ready');
	const hasOverrides = $derived(Object.keys(editorLiveLayer.overrides).length > 0);
	const liveTargetCount = $derived(panelModel.nodes.filter((node) => node.hasOverride).length);

	$effect(() => {
		nodeEditorState.sync(editorLiveLayer.activePath, panelModel.nodes);
	});

	$effect(() => {
		if (!hasReadyNodes || !editorLiveLayer.isActive) {
			clearModulatedTargetOverrides();
			return;
		}

		const edges = nodeEditorState.currentEdges;
		const sourceNodes = nodeEditorState.currentSourceNodes;
		const targetNodes = editorLiveLayer.editableParameters;
		let animationFrame = 0;

		const applyModulationFrame = (timeSeconds: number): boolean => {
			const modulationFrame = createNodeEditorModulationFrame(
				edges,
				sourceNodes,
				targetNodes,
				timeSeconds
			);

			syncModulatedTargetOverrides(modulationFrame.overrides);
			return modulationFrame.hasAnimatedSources;
		};

		untrack(() => {
			const hasAnimatedSources = applyModulationFrame(performance.now() / 1000);

			if (!hasAnimatedSources) {
				return;
			}

			const step = (time: number) => {
				const shouldContinue = applyModulationFrame(time / 1000);

				if (!shouldContinue) {
					animationFrame = 0;
					return;
				}

				animationFrame = requestAnimationFrame(step);
			};

			animationFrame = requestAnimationFrame(step);
		});

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});

	function handleValueChange(key: string, value: ThreeTemplateParameterValue): void {
		editorLiveLayer.setOverride(key, value);
	}

	function clearModulatedTargetOverrides(): void {
		for (const key of modulatedTargetValues.keys()) {
			editorLiveLayer.removeOverride(key);
		}

		modulatedTargetValues.clear();
	}

	function syncModulatedTargetOverrides(
		nextOverrides: Array<{
			key: string;
			value: number;
		}>
	): void {
		const nextOverrideKeys = new Set(nextOverrides.map((override) => override.key));

		for (const key of modulatedTargetValues.keys()) {
			if (nextOverrideKeys.has(key)) {
				continue;
			}

			modulatedTargetValues.delete(key);
			editorLiveLayer.removeOverride(key);
		}

		for (const override of nextOverrides) {
			if (modulatedTargetValues.get(override.key) === override.value) {
				continue;
			}

			modulatedTargetValues.set(override.key, override.value);
			editorLiveLayer.setOverride(override.key, override.value);
		}
	}
</script>

<section class="ui-pane ui-pane--muted" id={panelId}>
	<div class="ui-pane__header">
		<div class="node-editor__panel-heading">
			<p class="ui-surface-label">Node Editor</p>

			{#if hasReadyNodes}
				<Badge>{panelModel.nodes.length} targets</Badge>
			{/if}
		</div>
	</div>

	<div class="ui-pane__body ui-pane__body--flush">
		<div class="node-editor">
			{#if !hasReadyNodes}
				<div class="ui-workbench-placeholder node-editor__empty-state">
					<p class="ui-empty-state">{emptyState.title}</p>
					<p class="ui-text-muted">{emptyState.description}</p>
				</div>
			{:else}
				<div class="node-editor__toolbar">
					<ToggleGroup bind:value={nodeEditorState.filterMode} options={filterOptions} />
					<p class="ui-text-muted">
						{liveTargetCount} live override{liveTargetCount === 1 ? '' : 's'}
					</p>
				</div>

				<div class="node-editor__canvas-area">
					{#if nodeEditorState.visibleNodes.length === 0}
						<div class="ui-workbench-placeholder node-editor__empty-state">
							<p class="ui-empty-state">{filterEmptyState.title}</p>
							<p class="ui-text-muted">{filterEmptyState.description}</p>
						</div>
					{:else}
						<NodeEditorCanvas
							edges={panelModel.canvasEdges}
							nodes={panelModel.canvasNodes}
							viewport={panelModel.viewport}
							onConnect={nodeEditorState.connectNodes}
							onNodePositionChange={nodeEditorState.setNodePosition}
							onNodeSelect={nodeEditorState.selectNode}
							onResetLive={editorLiveLayer.removeOverride}
							onSourceNodeNormalizedValueChange={nodeEditorState.setSourceNodeNormalizedValue}
							onSourceNodeSpeedChange={nodeEditorState.setSourceNodeSpeed}
							onValueChange={handleValueChange}
							onViewportChange={nodeEditorState.syncViewport}
						/>
					{/if}
				</div>

				<div class="node-editor__panel-footer">
					<Button
						size="sm"
						variant="ghost"
						disabled={!hasOverrides}
						onclick={() => {
							editorLiveLayer.clearOverrides();
						}}
					>
						<RotateCcw aria-hidden="true" size={14} />
						<span>Reset live</span>
					</Button>

					<Button
						size="sm"
						disabled={!hasOverrides}
						onclick={() => {
							onApply?.();
						}}
					>
						<CheckCheck aria-hidden="true" size={14} />
						<span>Apply to code</span>
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
