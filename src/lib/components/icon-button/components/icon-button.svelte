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
