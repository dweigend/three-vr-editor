<!--
	Purpose: Render a reusable file picker for local editor-driven demos.
	Context: The Three editor toolbar should use the shared dropdown-menu primitive instead of a native select.
	Responsibility: Display editable files, bind the active file path, and expose the current selection in compact or labeled form.
	Boundaries: This component does not load file contents or know anything about preview behavior.
-->

<script lang="ts">
	import { DropdownMenu } from '$lib/components';
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

	const fileOptions = $derived(
		files.map((file) => ({
			label: file.name,
			meta: file.path === file.name ? undefined : file.path,
			value: file.path
		}))
	);
</script>

{#if compact}
	<div class={joinClassNames('file-select file-select--compact', className)}>
		<span class="sr-only">{label}</span>
		<DropdownMenu.Field
			ariaLabel={label}
			bind:value
			class="file-select__field"
			contentClass="file-select__content"
			itemClass="file-select__item"
			options={fileOptions}
			triggerClass="file-select__trigger"
		/>
	</div>
{:else}
	<label class={joinClassNames('ui-toolbar-field', className)}>
		<span class="ui-form-label">{label}</span>
		<DropdownMenu.Field
			ariaLabel={label}
			bind:value
			class="file-select__field"
			contentClass="file-select__content"
			itemClass="file-select__item"
			options={fileOptions}
			triggerClass="file-select__trigger"
		/>
	</label>
{/if}

<style>
	.file-select {
		display: grid;
	}

	.file-select--compact {
		min-width: min(14rem, 100%);
	}

	:global(.file-select__field) {
		min-width: 0;
	}

	:global(.file-select__trigger) {
		min-height: var(--ui-control-size);
		padding: 0.35rem 1.8rem 0.35rem 0.7rem;
		font-size: var(--ui-font-size-meta);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	:global(.file-select__content) {
		width: min(20rem, calc(100vw - 2rem));
	}

	:global(.file-select__item .ui-dropdown-field__item-label) {
		font-size: var(--ui-font-size-meta);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	:global(.file-select__item .ui-dropdown-field__item-meta) {
		font-size: var(--ui-font-size-meta);
	}
</style>
