<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableCellClass } from '../table.svelte';
	import type { TableCellProps } from '../types';

	let { children, class: className = '', ...restProps }: TableCellProps = $props();
</script>

<td {...restProps} class={joinClassNames(tableCellClass, className)}>
	{@render children?.()}
</td>
