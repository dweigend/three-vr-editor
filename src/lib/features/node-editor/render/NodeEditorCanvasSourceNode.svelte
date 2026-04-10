<script lang="ts">
	import { Handle, Position, type Node as SvelteFlowNode, type NodeProps } from '@xyflow/svelte';

	import type { NodeEditorSourceNode } from '../node-editor-types';

	type FlowNode = SvelteFlowNode<
		{
			onSourceNodeNormalizedValueChange?: ((key: string, value: number) => void) | undefined;
			onSourceNodeSpeedChange?: ((key: string, speed: number) => void) | undefined;
			source: NodeEditorSourceNode;
		},
		'slider-source' | 'lfo-source'
	>;

	let { data, selected = false }: NodeProps<FlowNode> = $props();

	const source = $derived(data.source);
	const outputLabel = $derived(
		source.kind === 'lfo-source' ? `${source.speed.toFixed(2)} Hz` : source.normalizedValue.toFixed(2)
	);

	function handleNormalizedValueChange(rawValue: string): void {
		data.onSourceNodeNormalizedValueChange?.(source.key, Number(rawValue));
	}

	function handleSpeedChange(rawValue: string): void {
		data.onSourceNodeSpeedChange?.(source.key, Number(rawValue));
	}
</script>

<div
	class:node-editor__flow-node--selected={selected}
	class:node-editor__flow-node--source={true}
	class="node-editor__flow-node"
>
	<div class="node-editor__flow-node-header">
		<p class="node-editor__flow-node-title">{source.label}</p>
		<p class="node-editor__flow-node-kind">{source.kind === 'lfo-source' ? 'LFO' : 'Slider'}</p>
	</div>

	<div class="node-editor__flow-node-value-row">
		<p class="node-editor__flow-node-value">{outputLabel}</p>
	</div>

	<div class="node-editor__node-control-row">
		{#if source.kind === 'lfo-source'}
			<input
				class="node-editor__range-input nodrag nopan"
				max={1.5}
				min={0.05}
				step={0.05}
				type="range"
				value={source.speed}
				oninput={(event) => handleSpeedChange(event.currentTarget.value)}
			/>
			<p class="node-editor__node-caption">{source.speed.toFixed(2)} Hz</p>
		{:else}
			<input
				class="node-editor__range-input nodrag nopan"
				max={1}
				min={0}
				step={0.01}
				type="range"
				value={source.normalizedValue}
				oninput={(event) => handleNormalizedValueChange(event.currentTarget.value)}
			/>
			<p class="node-editor__node-caption">0.00 to 1.00</p>
		{/if}
	</div>

	<Handle
		class="node-editor__flow-handle node-editor__flow-handle--source"
		id={`${source.key}-source`}
		isConnectable={true}
		position={Position.Right}
		type="source"
	/>
</div>
