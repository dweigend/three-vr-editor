<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import type { DropdownMenuRootProps } from '../types';

	let { open = $bindable(false), ...restProps }: DropdownMenuRootProps = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {...restProps} />
