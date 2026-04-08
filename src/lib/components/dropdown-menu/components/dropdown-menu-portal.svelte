<!--
	Purpose: Mirror the official Bits UI dropdown-menu portal component.
	Context: Portalled content should stay part of the reusable family so overlays behave consistently across surfaces.
	Responsibility: Forward all portal props unchanged to Bits UI.
	Boundaries: This wrapper does not style or position menu content on its own.
-->

<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import type { DropdownMenuPortalProps } from '../types';

	let { ...restProps }: DropdownMenuPortalProps = $props();
</script>

<DropdownMenuPrimitive.Portal {...restProps} />
