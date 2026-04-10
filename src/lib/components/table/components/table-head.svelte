<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableHeadClass } from '../table.svelte';
	import type { TableHeadProps } from '../types';

	let { children, class: className = '', ...restProps }: TableHeadProps = $props();
</script>

<th {...restProps} class={joinClassNames(tableHeadClass, className)}>
	{@render children?.()}
</th>
