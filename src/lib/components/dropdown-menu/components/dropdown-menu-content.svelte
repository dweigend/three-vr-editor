<!--
	Purpose: Render styled dropdown-menu content while preserving the official Bits UI API.
	Context: Compact settings menus need one shared surface instead of per-route floating panel CSS.
	Responsibility: Forward content props to Bits UI and attach the shared menu surface class.
	Boundaries: This component stays presentational and does not manage item selection semantics.
-->

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
