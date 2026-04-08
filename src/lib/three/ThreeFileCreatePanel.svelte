<!--
	Purpose: Provide a small file-creation control surface for the additive Three template workbench.
	Context: The new editor route needs an additive way to create blank scenes or new scene files from managed templates.
	Responsibility: Collect the file name, creation mode, optional template selection, and submit one create request at a time.
	Boundaries: This component does not access the filesystem directly or know anything about preview orchestration.
-->

<script lang="ts">
	import type { ThreeCreateFileRequest, ThreeTemplateSummary } from '$lib/three/three-template-types';

	type Props = {
		onCreate: (request: ThreeCreateFileRequest) => Promise<void>;
		templates: ThreeTemplateSummary[];
	};

	let { onCreate, templates }: Props = $props();

	let fileName = $state('new-scene');
	let mode = $state<'blank' | 'template'>('blank');
	let selectedTemplatePath = $state('');
	let errorMessage = $state<string | null>(null);
	let isSubmitting = $state(false);
	const firstTemplatePath = $derived(templates[0]?.path ?? '');

	$effect(() => {
		if (selectedTemplatePath.length > 0 || firstTemplatePath.length === 0) {
			return;
		}

		selectedTemplatePath = firstTemplatePath;
	});

	async function handleCreate(): Promise<void> {
		const normalizedFileName = fileName.trim();

		if (normalizedFileName.length === 0 || isSubmitting) {
			return;
		}

		errorMessage = null;
		isSubmitting = true;

		try {
			if (mode === 'blank') {
				await onCreate({
					fileName: normalizedFileName,
					mode: 'blank'
				});
			} else {
				if (selectedTemplatePath.length === 0) {
					throw new Error('Choose a template first.');
				}

				await onCreate({
					fileName: normalizedFileName,
					mode: 'template',
					templatePath: selectedTemplatePath
				});
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Create file failed.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="panel">
	<h2>New file</h2>

	<label class="field">
		<span>File name</span>
		<input bind:value={fileName} type="text" placeholder="new-scene" />
	</label>

	<label class="field">
		<span>Mode</span>
		<select bind:value={mode}>
			<option value="blank">Blank starter</option>
			<option value="template">From template</option>
		</select>
	</label>

	{#if mode === 'template'}
		<label class="field">
			<span>Template</span>
			<select bind:value={selectedTemplatePath}>
				{#each templates as template}
					<option value={template.path}>{template.title}</option>
				{/each}
			</select>
		</label>

		{#if selectedTemplatePath}
			{@const selectedTemplate = templates.find((template) => template.path === selectedTemplatePath)}
			{#if selectedTemplate}
				<p class="hint">{selectedTemplate.description}</p>
			{/if}
		{/if}
	{/if}

	<div class="actions">
		<button type="button" onclick={handleCreate} disabled={isSubmitting || fileName.trim().length === 0}>
			{isSubmitting ? 'Creating...' : 'Create file'}
		</button>
	</div>

	{#if errorMessage}
		<p class="error">{errorMessage}</p>
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

	.field {
		display: grid;
		gap: 0.35rem;
	}

	.field input,
	.field select {
		font: inherit;
		padding: 0.55rem 0.65rem;
	}

	.hint {
		color: #52525b;
		font-size: 0.95rem;
		margin: 0;
	}

	.actions {
		display: flex;
		justify-content: flex-start;
	}

	.error {
		color: #b91c1c;
		margin: 0;
	}
</style>
