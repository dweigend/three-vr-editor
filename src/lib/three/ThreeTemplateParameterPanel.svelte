<!--
	Purpose: Render optional parameter controls from the active Three scene source when a recognized template header is present.
	Context: The additive template workbench should opportunistically expose sliders, color pickers, selects, and text inputs without breaking plain files.
	Responsibility: Parse the active source, show dynamic controls when available, and write updated template parameters back into the source text.
	Boundaries: This panel does not persist files, infer arbitrary code structure, or require the header to exist.
-->

<script lang="ts">
	import {
		readThreeTemplateSourceDetails,
		writeThreeTemplateParameters
	} from '$lib/three/three-template-source';
	import type { ThreeTemplateParameterDefinition, ThreeTemplateParameterValue } from '$lib/three/three-template-types';

	type Props = {
		onSourceChange: (value: string) => void;
		source: string;
	};

	let { onSourceChange, source }: Props = $props();

	const templateDetails = $derived(readThreeTemplateSourceDetails(source));
	const templateHeader = $derived(templateDetails.header);
	const templateParameters = $derived(templateDetails.parameters);

	function readParameterValue(definition: ThreeTemplateParameterDefinition): ThreeTemplateParameterValue {
		return templateParameters?.[definition.key] ?? definition.defaultValue;
	}

	function updateParameter(definition: ThreeTemplateParameterDefinition, nextValue: string): void {
		if (!templateHeader || !templateParameters) {
			return;
		}

		const parsedValue =
			definition.control === 'range' ? Number.parseFloat(nextValue) : nextValue;
		const nextParameters = {
			...templateParameters,
			[definition.key]: parsedValue
		};

		onSourceChange(writeThreeTemplateParameters(source, nextParameters));
	}
</script>

<section class="panel">
	<h2>Parameters</h2>

	{#if !templateHeader}
		<p class="hint">No optional template header found in the active file.</p>
	{:else if !templateParameters}
		<p class="hint">This template declares controls but has no editable parameter block yet.</p>
	{:else if templateHeader.parameters.length === 0}
		<p class="hint">This template does not expose any editable controls.</p>
	{:else}
		<p class="hint">{templateHeader.description}</p>

		<div class="parameter-list">
			{#each templateHeader.parameters as definition}
				<label class="field">
					<span>{definition.label}</span>

					{#if definition.control === 'color'}
						<input
							type="color"
							value={String(readParameterValue(definition))}
							oninput={(event) => updateParameter(definition, event.currentTarget.value)}
						/>
					{:else if definition.control === 'range'}
						<div class="range-field">
							<input
								type="range"
								min={definition.min}
								max={definition.max}
								step={definition.step ?? 0.1}
								value={Number(readParameterValue(definition))}
								oninput={(event) => updateParameter(definition, event.currentTarget.value)}
							/>
							<output>{Number(readParameterValue(definition)).toFixed(2)}</output>
						</div>
					{:else if definition.control === 'select'}
						<select
							value={String(readParameterValue(definition))}
							onchange={(event) => updateParameter(definition, event.currentTarget.value)}
						>
							{#each definition.options as option}
								<option value={String(option.value)}>{option.label}</option>
							{/each}
						</select>
					{:else}
						<input
							type="text"
							value={String(readParameterValue(definition))}
							placeholder={definition.placeholder}
							oninput={(event) => updateParameter(definition, event.currentTarget.value)}
						/>
					{/if}
				</label>
			{/each}
		</div>
	{/if}
</section>

<style>
	.panel {
		border: 1px solid #d4d4d8;
		border-radius: 0.75rem;
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
	}

	.hint {
		color: #52525b;
		margin: 0;
	}

	.parameter-list {
		display: grid;
		gap: 0.9rem;
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}

	.field input,
	.field select {
		font: inherit;
		padding: 0.45rem 0.55rem;
		width: 100%;
	}

	.field input[type='color'] {
		min-height: 2.6rem;
		padding: 0.2rem;
	}

	.range-field {
		align-items: center;
		display: grid;
		gap: 0.5rem;
		grid-template-columns: minmax(0, 1fr) auto;
	}

	.range-field output {
		color: #18181b;
		font-variant-numeric: tabular-nums;
	}
</style>
