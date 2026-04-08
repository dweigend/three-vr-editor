<!--
	Purpose: Render the semantic table body section for the table primitive family.
	Context: The table family exposes dedicated wrappers for native table parts to keep call sites consistent.
	Responsibility: Provide a typed wrapper around `<tbody>`.
	Boundaries: This component stays presentational and does not manage row state.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableBodyClass } from '../table.svelte';
	import type { TableBodyProps } from '../types';

	let { children, class: className = '', ...restProps }: TableBodyProps = $props();
</script>

<tbody {...restProps} class={joinClassNames(tableBodyClass, className)}>
	{@render children?.()}
</tbody>
