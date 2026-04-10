<script lang="ts">
	import CheckCheck from '@lucide/svelte/icons/check-check';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	import { Button, Card, CardBody, CardFooter, Separator, TextInput } from '$lib/components';
	import { editorLiveLayer } from '$lib/features/editor/editor-live-layer.svelte';
	import {
		formatResolvedEditorLiveParameterValue,
		isEditorLiveHexColor,
		parseEditorLiveParameterValue
	} from '$lib/features/editor/editor-live-parameter-values';
	import {
		readControlPanelEmptyState
	} from './controlls-panel';

	type Props = {
		activeFileName?: string | null;
		onApply?: (() => void) | undefined;
		panelId: string;
	};

	let { activeFileName = null, onApply, panelId }: Props = $props();
	let colorDraftValues = $state<Record<string, string>>({});

	const emptyState = $derived(
		readControlPanelEmptyState(editorLiveLayer.discovery.status, activeFileName)
	);
	const hasReadyControls = $derived(editorLiveLayer.discovery.status === 'ready');
	const hasOverrides = $derived(Object.keys(editorLiveLayer.overrides).length > 0);

	$effect(() => {
		const nextDraftValues: Record<string, string> = {};

		for (const parameter of editorLiveLayer.resolvedParameters) {
			if (parameter.definition.control !== 'color') {
				continue;
			}

			const draftValue = colorDraftValues[parameter.key];

			if (draftValue && draftValue !== String(parameter.resolvedValue)) {
				nextDraftValues[parameter.key] = draftValue;
			}
		}

		const currentEntries = Object.entries(colorDraftValues);
		const nextEntries = Object.entries(nextDraftValues);
		const hasChanged =
			currentEntries.length !== nextEntries.length ||
			nextEntries.some(([key, value]) => colorDraftValues[key] !== value);

		if (hasChanged) {
			colorDraftValues = nextDraftValues;
		}
	});

	function handleParameterInput(key: string, nextValue: string): void {
		const parameter = editorLiveLayer.resolvedParameters.find((candidate) => candidate.key === key);

		if (!parameter) {
			return;
		}

		editorLiveLayer.setOverride(
			key,
			parseEditorLiveParameterValue(parameter.definition, nextValue)
		);
	}

	function handleColorInput(key: string, nextValue: string): void {
		colorDraftValues = {
			...colorDraftValues,
			[key]: nextValue
		};

		if (!isEditorLiveHexColor(nextValue)) {
			return;
		}

		handleParameterInput(key, nextValue);
	}

	function handleColorBlur(key: string, resolvedValue: string): void {
		const draftValue = colorDraftValues[key];

		if (!draftValue) {
			return;
		}

		if (isEditorLiveHexColor(draftValue)) {
			const { [key]: _removedDraftValue, ...nextDraftValues } = colorDraftValues;
			colorDraftValues = nextDraftValues;
			return;
		}

		colorDraftValues = {
			...colorDraftValues,
			[key]: resolvedValue
		};
	}

	function readColorFieldValue(key: string, resolvedValue: string): string {
		return colorDraftValues[key] ?? resolvedValue;
	}
</script>

<section class="ui-pane ui-pane--muted" id={panelId}>
	<div class="ui-pane__header">
		<p class="ui-surface-label">Controls</p>
	</div>

	<div class="ui-pane__body ui-pane__body--scroll">
		<div class="control-panel">
			{#if !hasReadyControls}
				<div class="ui-workbench-placeholder">
					<p class="ui-empty-state">{emptyState.title}</p>
					<p class="ui-text-muted">{emptyState.description}</p>
				</div>
			{:else}
				<Card>
					<CardBody class="control-panel__body">
						{#each editorLiveLayer.resolvedParameters as parameter, parameterIndex (parameter.key)}
							{@const inputId = `control-panel-${parameter.key}`}

							<div class="control-panel__field">
								<div class="control-panel__field-row">
									<label class="ui-form-label" for={inputId}>
										{parameter.definition.label}
									</label>

									{#if parameter.definition.control === 'range'}
										<output class="control-panel__field-meta" for={inputId}>
											{formatResolvedEditorLiveParameterValue(parameter)}
										</output>
									{/if}
								</div>

								{#if parameter.definition.control === 'range'}
									<input
										id={inputId}
										class="control-panel__range-input"
										max={parameter.definition.max}
										min={parameter.definition.min}
										step={parameter.definition.step ?? 0.1}
										type="range"
										value={Number(parameter.resolvedValue)}
										oninput={(event) =>
											handleParameterInput(parameter.key, event.currentTarget.value)}
									/>
								{:else if parameter.definition.control === 'color'}
									<div class="control-panel__color-row">
										<input
											id={inputId}
											class="control-panel__color-input"
											type="color"
											value={String(parameter.resolvedValue)}
											oninput={(event) =>
												handleColorInput(parameter.key, event.currentTarget.value)}
										/>

										<TextInput
											class="control-panel__color-text"
											id={`${inputId}-text`}
											name={`${inputId}-text`}
											value={readColorFieldValue(
												parameter.key,
												String(parameter.resolvedValue)
											)}
											onblur={() =>
												handleColorBlur(parameter.key, String(parameter.resolvedValue))}
											oninput={(event) =>
												handleColorInput(parameter.key, event.currentTarget.value)}
										/>
									</div>
								{:else if parameter.definition.control === 'select'}
									<select
										id={inputId}
										class="ui-select"
										name={inputId}
										value={String(parameter.resolvedValue)}
										onchange={(event) =>
											handleParameterInput(parameter.key, event.currentTarget.value)}
									>
										{#each parameter.definition.options as option}
											<option value={String(option.value)}>{option.label}</option>
										{/each}
									</select>
								{:else}
									<TextInput
										id={inputId}
										name={inputId}
										placeholder={parameter.definition.placeholder}
										type="text"
										value={String(parameter.resolvedValue)}
										oninput={(event) =>
											handleParameterInput(parameter.key, event.currentTarget.value)}
									/>
								{/if}
							</div>

							{#if parameterIndex < editorLiveLayer.resolvedParameters.length - 1}
								<Separator />
							{/if}
						{/each}
					</CardBody>
				</Card>

				<Card>
					<CardFooter class="control-panel__footer">
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
					</CardFooter>
				</Card>
			{/if}
		</div>
	</div>
</section>
