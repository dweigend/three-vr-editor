<!--
	Purpose: Render a compact icon-first button variant for shell and toolbar actions.
	Context: The app shell uses this primitive for the top-right settings trigger and similar utility actions.
	Responsibility: Wrap the shared button primitive with icon-oriented sizing and accessible labelling.
	Boundaries: The component stays presentational and does not own menu or routing behavior.
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Button } from '$lib/components/button';
	import { joinClassNames } from '$lib/utils/class-names';

	type Props = {
		ariaLabel: string;
		children?: Snippet;
		class?: string;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
	} & Record<string, unknown>;

	let {
		ariaLabel,
		children,
		class: className = '',
		disabled = false,
		type = 'button',
		variant = 'ghost',
		...restProps
	}: Props = $props();
</script>

<Button
	class={joinClassNames('ui-icon-button', className)}
	{disabled}
	{type}
	{variant}
	size="sm"
	{...restProps}
>
	<span aria-hidden="true">{@render children?.()}</span>
	<span class="sr-only">{ariaLabel}</span>
</Button>
