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

<section class="ui-pane">
	<div class="ui-pane__header">
		<p class="ui-surface-label">New file</p>
	</div>

	<div class="ui-pane__body">
		<div class="ui-form-grid">
			<label class="ui-form-row">
				<span class="ui-form-label">File name</span>
				<input bind:value={fileName} class="ui-input" type="text" placeholder="new-scene" />
			</label>

			<label class="ui-form-row">
				<span class="ui-form-label">Mode</span>
				<select bind:value={mode} class="ui-select">
			<option value="blank">Blank starter</option>
			<option value="template">From template</option>
				</select>
			</label>

			{#if mode === 'template'}
				<label class="ui-form-row">
					<span class="ui-form-label">Template</span>
					<select bind:value={selectedTemplatePath} class="ui-select">
						{#each templates as template}
							<option value={template.path}>{template.title}</option>
						{/each}
					</select>
				</label>

				{#if selectedTemplatePath}
					{@const selectedTemplate = templates.find((template) => template.path === selectedTemplatePath)}
					{#if selectedTemplate}
						<p class="ui-status">{selectedTemplate.description}</p>
					{/if}
				{/if}
			{/if}

			<div class="ui-inline">
				<button
					class="ui-button"
					type="button"
					onclick={handleCreate}
					disabled={isSubmitting || fileName.trim().length === 0}
				>
					{isSubmitting ? 'Creating...' : 'Create file'}
				</button>
			</div>

			{#if errorMessage}
				<p class="ui-status ui-status--danger">{errorMessage}</p>
			{/if}
		</div>
	</div>
</section>
