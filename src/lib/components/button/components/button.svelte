<!--
	Purpose: Render the shared button primitive with small reusable variants and sizes.
	Context: The start screen and future reusable blocks need one consistent action surface without introducing a larger dependency stack.
	Responsibility: Support button and link rendering while keeping styling hooks aligned with the local ui-system adaptation.
	Boundaries: This component stays presentational and does not own routing or app-specific state.
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { joinClassNames } from '$lib/utils/class-names';

	type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type ButtonSize = 'sm' | 'md' | 'lg';

	type Props = {
		children?: Snippet;
		class?: string;
		disabled?: boolean;
		href?: string;
		size?: ButtonSize;
		type?: 'button' | 'submit' | 'reset';
		variant?: ButtonVariant;
	} & Record<string, unknown>;

	let {
		children,
		class: className = '',
		disabled = false,
		href,
		size = 'md',
		type = 'button',
		variant = 'primary',
		...restProps
	}: Props = $props();
</script>

{#if href}
	<a
		aria-disabled={disabled}
		class={joinClassNames(
			'ui-button',
			`ui-button--${variant}`,
			size !== 'md' && `ui-button--${size}`,
			className
		)}
		href={disabled ? undefined : href}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		{disabled}
		{type}
		class={joinClassNames(
			'ui-button',
			`ui-button--${variant}`,
			size !== 'md' && `ui-button--${size}`,
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
