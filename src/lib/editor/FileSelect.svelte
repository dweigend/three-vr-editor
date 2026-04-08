<!--
	Purpose: Render a reusable file dropdown for local editor-driven demos.
	Context: The Three editor page should stay thin and compose simple library modules for file selection.
	Responsibility: Display file options and bind the active file path.
	Boundaries: This component does not load file contents or know anything about preview behavior.
-->

<script lang="ts">
	import type { ThreeSourceFileSummary } from '$lib/three/three-editor-types';

	type Props = {
		files: ThreeSourceFileSummary[];
		label?: string;
		value?: string;
	};

	let { files, label = 'File', value = $bindable('') }: Props = $props();
</script>

<label class="ui-toolbar-field">
	<span class="ui-form-label">{label}</span>
	<select class="ui-select" bind:value>
		{#each files as file}
			<option value={file.path}>{file.path}</option>
		{/each}
	</select>
</label>
