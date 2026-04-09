<!--
	Purpose: Render the root compact table shell with horizontal overflow support.
	Context: Data-heavy settings screens need a semantic table that stays compact and scrollable on narrow viewports.
	Responsibility: Provide the table wrapper, overflow container, and shared family styling.
	Boundaries: This component stays presentational and does not manage sorting, filtering, or pagination.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableRootClass, tableScrollClass, tableShellClass } from '../table.svelte';
	import type { TableProps } from '../types';

	let {
		ariaLabel,
		children,
		class: className = '',
		tableClass = '',
		...restProps
	}: TableProps = $props();
</script>

<div {...restProps} class={joinClassNames(tableShellClass, className)}>
	<div class={tableScrollClass}>
		<table aria-label={ariaLabel} class={joinClassNames(tableRootClass, tableClass)}>
			{@render children?.()}
		</table>
	</div>
</div>
