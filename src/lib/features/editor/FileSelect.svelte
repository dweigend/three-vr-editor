<script lang="ts">
	import { DropdownMenu } from '$lib/components';
	import { joinClassNames } from '$lib/utils/class-names';
	import type { ThreeSourceFileSummary } from '$lib/features/editor/three-editor-types';
	import '$lib/features/editor/file-select.css';

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
