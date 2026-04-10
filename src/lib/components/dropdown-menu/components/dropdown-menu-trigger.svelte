<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import type { DropdownMenuTriggerProps } from '../types';

	let { ref = $bindable(null), ...restProps }: DropdownMenuTriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger bind:ref {...restProps} />
