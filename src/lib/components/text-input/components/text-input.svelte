<!--
	Purpose: Render the shared single-line input primitive for form fields and compact control rows.
	Context: Settings and editor flows need one reusable input surface instead of repeating raw input markup.
	Responsibility: Forward standard input props and attach the shared text-input styling hook.
	Boundaries: This component stays presentational and does not validate values or submit forms.
-->

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	import { joinClassNames } from '$lib/utils/class-names';

	type Props = {
		autocomplete?: HTMLInputAttributes['autocomplete'];
		class?: string;
		disabled?: boolean;
		id?: string;
		max?: number | string;
		min?: number | string;
		name?: string;
		placeholder?: string;
		readonly?: boolean;
		required?: boolean;
		spellcheck?: boolean;
		step?: number | string;
		type?: HTMLInputAttributes['type'];
		value?: string | number;
	} & Omit<HTMLInputAttributes, 'class' | 'type' | 'value'>;

	let {
		autocomplete,
		class: className = '',
		disabled = false,
		id,
		max,
		min,
		name,
		placeholder,
		readonly = false,
		required = false,
		spellcheck,
		step,
		type = 'text',
		value = $bindable<string | number>(''),
		...restProps
	}: Props = $props();
</script>

<input
	{...restProps}
	bind:value
	{autocomplete}
	class={joinClassNames('ui-input', className)}
	{disabled}
	{id}
	{max}
	{min}
	{name}
	{placeholder}
	{readonly}
	{required}
	{spellcheck}
	{step}
	{type}
/>
