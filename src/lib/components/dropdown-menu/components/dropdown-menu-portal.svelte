<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import type { DropdownMenuPortalProps } from '../types';

	let { ...restProps }: DropdownMenuPortalProps = $props();
</script>

<DropdownMenuPrimitive.Portal {...restProps} />
