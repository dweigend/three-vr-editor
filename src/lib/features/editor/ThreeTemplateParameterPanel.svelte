<!--
	Purpose: Render optional parameter controls from the active Three scene source when a recognized template header is present.
	Context: The editor sidebar should opportunistically expose sliders, color pickers, selects, and text inputs without breaking plain files.
	Responsibility: Parse the active source, show dynamic controls when available, and write updated template parameters back into the source text.
	Boundaries: This panel does not persist files, infer arbitrary code structure, or require the header to exist.
-->

<script lang="ts">
	import { TextInput } from '$lib/components';
	import {
		readThreeTemplateSourceDetails,
		writeThreeTemplateParameters
	} from '$lib/features/editor/three-template-source';
	import type { ThreeTemplateParameterDefinition, ThreeTemplateParameterValue } from '$lib/features/editor/three-template-types';

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

<section class="ui-pane">
	<div class="ui-pane__header">
		<p class="ui-surface-label">Parameters</p>
	</div>

	<div class="ui-pane__body ui-pane__body--scroll">
		{#if !templateHeader}
			<p class="ui-status">No optional template header found in the active file.</p>
		{:else if !templateParameters}
			<p class="ui-status">This template declares controls but has no editable parameter block.</p>
		{:else if templateHeader.parameters.length === 0}
			<p class="ui-status">This template does not expose any editable controls.</p>
		{:else}
			<div class="ui-form-grid">
				<p class="ui-status">{templateHeader.description}</p>

				<div class="parameter-list">
					{#each templateHeader.parameters as definition}
						<label class="ui-form-row">
							<span class="ui-form-label">{definition.label}</span>

							{#if definition.control === 'color'}
								<input
									class="parameter-color"
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
									class="ui-select"
									value={String(readParameterValue(definition))}
									onchange={(event) => updateParameter(definition, event.currentTarget.value)}
								>
									{#each definition.options as option}
										<option value={String(option.value)}>{option.label}</option>
									{/each}
								</select>
							{:else}
								<TextInput
									value={String(readParameterValue(definition))}
									placeholder={definition.placeholder}
									type="text"
									oninput={(event) => updateParameter(definition, event.currentTarget.value)}
								/>
							{/if}
						</label>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
