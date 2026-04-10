<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DropdownMenu as DropdownMenuPrimitive, type WithoutChildrenOrChild } from 'bits-ui';

	import { joinClassNames } from '$lib/utils/class-names';

	import { dropdownMenuContentClass } from '../dropdown-menu.svelte';
	import type { DropdownMenuContentProps } from '../types';

	type Props = WithoutChildrenOrChild<DropdownMenuContentProps> & {
		children?: Snippet;
	};

	let { ref = $bindable(null), class: className = '', children, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.Content
	bind:ref
	{...restProps}
	class={joinClassNames(dropdownMenuContentClass, className)}
>
	{@render children?.()}
</DropdownMenuPrimitive.Content>
