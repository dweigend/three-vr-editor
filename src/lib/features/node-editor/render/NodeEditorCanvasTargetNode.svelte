<script lang="ts">
	import { Handle, Position, type Node as SvelteFlowNode, type NodeProps } from '@xyflow/svelte';

	import {
		formatEditorLiveParameterValue,
		parseEditorLiveParameterValue
	} from '$lib/features/editor/editor-live-parameter-values';
	import type { ThreeTemplateParameterValue } from '$lib/features/editor/three-template-types';
	import type { NodeEditorTargetNode } from '../node-editor-types';

	type FlowNode = SvelteFlowNode<
		{
			onResetLive?: ((key: string) => void) | undefined;
			onValueChange?: ((key: string, value: ThreeTemplateParameterValue) => void) | undefined;
			target: NodeEditorTargetNode;
		},
		'target'
	>;

	let { data, selected = false }: NodeProps<FlowNode> = $props();

	const target = $derived(data.target);
	const valueLabel = $derived(formatEditorLiveParameterValue(target.definition, target.resolvedValue));
	const kindLabel = $derived(target.definition.control);

	function handleValueChange(rawValue: string): void {
		data.onValueChange?.(target.key, parseEditorLiveParameterValue(target.definition, rawValue));
	}
</script>

<div class:node-editor__flow-node--selected={selected} class="node-editor__flow-node">
	{#if target.definition.control === 'range'}
		<Handle
			class="node-editor__flow-handle node-editor__flow-handle--target"
			id={`${target.key}-target`}
			isConnectable={true}
			position={Position.Left}
			type="target"
		/>
	{/if}

	<div class="node-editor__flow-node-header">
		<p class="node-editor__flow-node-title">{target.definition.label}</p>
		<p class="node-editor__flow-node-kind">{kindLabel}</p>
	</div>

	<div class="node-editor__flow-node-value-row">
		<p class="node-editor__flow-node-value">{valueLabel}</p>

		{#if target.hasOverride}
			<button
				class="node-editor__node-button nodrag nopan"
				type="button"
				onclick={() => data.onResetLive?.(target.key)}
			>
				Reset
			</button>
		{/if}
	</div>

	{#if target.definition.control === 'range'}
		<div class="node-editor__node-control-row">
			<input
				class="node-editor__range-input nodrag nopan"
				max={target.definition.max}
				min={target.definition.min}
				step={target.definition.step ?? 0.1}
				type="range"
				value={Number(target.resolvedValue)}
				oninput={(event) => handleValueChange(event.currentTarget.value)}
			/>
		</div>
	{:else if target.definition.control === 'color'}
		<div class="node-editor__node-control-row node-editor__node-control-row--compact">
			<input
				class="node-editor__color-input nodrag nopan"
				type="color"
				value={String(target.resolvedValue)}
				oninput={(event) => handleValueChange(event.currentTarget.value)}
			/>
		</div>
	{:else if target.definition.control === 'select'}
		<div class="node-editor__node-control-row">
			<select
				class="ui-select node-editor__node-select nodrag nopan"
				value={String(target.resolvedValue)}
				onchange={(event) => handleValueChange(event.currentTarget.value)}
			>
				{#each target.definition.options as option}
					<option value={String(option.value)}>{option.label}</option>
				{/each}
			</select>
		</div>
	{:else}
		<div class="node-editor__node-control-row">
			<input
				class="ui-input node-editor__node-input nodrag nopan"
				placeholder={target.definition.placeholder}
				type="text"
				value={String(target.resolvedValue)}
				oninput={(event) => handleValueChange(event.currentTarget.value)}
			/>
		</div>
	{/if}
</div>
