<!--
	Purpose: Render a semantic table header cell for compact data tables.
	Context: The table family exposes dedicated wrappers for native table parts to keep call sites consistent.
	Responsibility: Provide a typed wrapper around `<th>`.
	Boundaries: This component stays presentational and does not manage sorting or resize behavior.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableHeadClass } from '../table.svelte';
	import type { TableHeadProps } from '../types';

	let { children, class: className = '', ...restProps }: TableHeadProps = $props();
</script>

<th {...restProps} class={joinClassNames(tableHeadClass, className)}>
	{@render children?.()}
</th>
