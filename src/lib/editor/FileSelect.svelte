<!--
	Purpose: Render a reusable file dropdown for local editor-driven demos.
	Context: The Three editor page should stay thin and compose simple library modules for file selection.
	Responsibility: Display file options and bind the active file path.
	Boundaries: This component does not load file contents or know anything about preview behavior.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';
	import type { ThreeSourceFileSummary } from '$lib/three/three-editor-types';

	type Props = {
		class?: string;
		compact?: boolean;
		files: ThreeSourceFileSummary[];
		label?: string;
		value?: string;
	};

	let {
		class: className = '',
		compact = false,
		files,
		label = 'File',
		value = $bindable('')
	}: Props = $props();
</script>

{#if compact}
	<label class={joinClassNames('file-select file-select--compact', className)}>
		<span class="sr-only">{label}</span>
		<select class="ui-select file-select__input" bind:value>
			{#each files as file}
				<option value={file.path}>{file.path}</option>
			{/each}
		</select>
	</label>
{:else}
	<label class={joinClassNames('ui-toolbar-field', className)}>
		<span class="ui-form-label">{label}</span>
		<select class="ui-select" bind:value>
			{#each files as file}
				<option value={file.path}>{file.path}</option>
			{/each}
		</select>
	</label>
{/if}

<style>
	.file-select {
		display: grid;
	}

	.file-select--compact {
		min-width: min(12.5rem, 100%);
	}

	.file-select__input {
		min-height: var(--ui-control-size);
		padding: 0.4rem 1.8rem 0.4rem 0.7rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
