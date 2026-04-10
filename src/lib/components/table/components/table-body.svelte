<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableBodyClass } from '../table.svelte';
	import type { TableBodyProps } from '../types';

	let { children, class: className = '', ...restProps }: TableBodyProps = $props();
</script>

<tbody {...restProps} class={joinClassNames(tableBodyClass, className)}>
	{@render children?.()}
</tbody>
