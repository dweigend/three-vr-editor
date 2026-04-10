<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableHeaderClass } from '../table.svelte';
	import type { TableSectionProps } from '../types';

	let { children, class: className = '', ...restProps }: TableSectionProps = $props();
</script>

<thead {...restProps} class={joinClassNames(tableHeaderClass, className)}>
	{@render children?.()}
</thead>
