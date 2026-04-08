<!--
	Purpose: Render the semantic table header section for the table primitive family.
	Context: The table family exposes dedicated wrappers for native table parts to keep call sites consistent.
	Responsibility: Provide a typed wrapper around `<thead>`.
	Boundaries: This component stays presentational and does not manage column behavior.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableHeaderClass } from '../table.svelte';
	import type { TableSectionProps } from '../types';

	let { children, class: className = '', ...restProps }: TableSectionProps = $props();
</script>

<thead {...restProps} class={joinClassNames(tableHeaderClass, className)}>
	{@render children?.()}
</thead>
