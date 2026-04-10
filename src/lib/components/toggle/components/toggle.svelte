<script lang="ts">
	import type { Snippet } from 'svelte';
	import { joinClassNames } from '$lib/utils/class-names';
	import { toggleRootClass } from '../toggle.svelte';

	type Props = {
		children?: Snippet;
		class?: string;
		disabled?: boolean;
		onclick?: () => void;
		pressed?: boolean;
	};

	let {
		children,
		class: className = '',
		disabled = false,
		onclick,
		pressed = $bindable(false)
	}: Props = $props();
</script>

<button
	class={joinClassNames(toggleRootClass, className)}
	data-state={pressed ? 'on' : 'off'}
	aria-pressed={pressed}
	{disabled}
	type="button"
	onclick={() => {
		if (!disabled) {
			pressed = !pressed;
			onclick?.();
		}
	}}
>
	{@render children?.()}
</button>
