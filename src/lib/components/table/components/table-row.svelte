<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableRowClass } from '../table.svelte';
	import type { TableRowProps } from '../types';

	let { children, class: className = '', selected = false, ...restProps }: TableRowProps = $props();
</script>

<tr
	{...restProps}
	class={joinClassNames(tableRowClass, className)}
	data-selected={selected ? 'true' : undefined}
>
	{@render children?.()}
</tr>
