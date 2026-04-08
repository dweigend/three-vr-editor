<!--
	Purpose: Render a semantic table body cell for compact data tables.
	Context: The table family exposes dedicated wrappers for native table parts to keep call sites consistent.
	Responsibility: Provide a typed wrapper around `<td>`.
	Boundaries: This component stays presentational and does not manage cell interactions.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableCellClass } from '../table.svelte';
	import type { TableCellProps } from '../types';

	let { children, class: className = '', ...restProps }: TableCellProps = $props();
</script>

<td {...restProps} class={joinClassNames(tableCellClass, className)}>
	{@render children?.()}
</td>
