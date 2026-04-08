<!--
	Purpose: Forward the official Bits UI dropdown-menu root API unchanged.
	Context: Reusable menu surfaces should rely on Bits UI state handling instead of route-local open state.
	Responsibility: Bind the `open` state and pass through all remaining root props.
	Boundaries: This wrapper stays headless and does not style or interpret menu items.
-->

<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import type { DropdownMenuRootProps } from '../types';

	let { open = $bindable(false), ...restProps }: DropdownMenuRootProps = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {...restProps} />
