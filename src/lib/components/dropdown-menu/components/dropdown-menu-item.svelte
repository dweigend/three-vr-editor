<!--
	Purpose: Render a dropdown-menu item with the shared local menu item styling.
	Context: Selection rows across compact menus should share one interaction and spacing pattern.
	Responsibility: Forward Bits UI item props and apply the shared item class.
	Boundaries: This wrapper stays generic and does not decide selection state or item layout.
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import { joinClassNames } from '$lib/utils/class-names';

	import { dropdownMenuItemClass } from '../dropdown-menu.svelte';
	import type { DropdownMenuItemProps } from '../types';

	type Props = DropdownMenuItemProps & {
		children?: Snippet;
	};

	let { ref = $bindable(null), class: className = '', children, textValue, ...restProps }: Props =
		$props();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	{...restProps}
	{textValue}
	class={joinClassNames(dropdownMenuItemClass, className)}
>
	{#if children}
		{@render children()}
	{:else if textValue}
		<span>{textValue}</span>
	{/if}
</DropdownMenuPrimitive.Item>

<style>
	:global(.ui-menu-item) {
		width: 100%;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: default;
	}

	:global(.ui-menu-item[data-disabled]) {
		opacity: 0.45;
	}

	:global(.ui-menu-item:focus-visible) {
		outline: none;
	}
</style>
