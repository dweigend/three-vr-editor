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

<style>
	:global(.ui-data-table-shell) {
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	:global(.ui-data-table-scroll) {
		overflow-x: auto;
	}

	:global(.ui-data-table) {
		width: 100%;
		min-width: 42rem;
		border-collapse: collapse;
		table-layout: fixed;
	}

	:global(.ui-data-table__header) {
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global(.ui-data-table__row) {
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global(.ui-data-table__body .ui-data-table__row:last-child) {
		border-bottom: 0;
	}

	:global(.ui-data-table__row[data-selected='true']) {
		background: rgba(168, 85, 247, 0.08);
	}

	:global(.ui-data-table__head),
	:global(.ui-data-table__cell) {
		padding: 0.7rem 0.9rem;
		text-align: left;
		vertical-align: top;
	}

	:global(.ui-data-table__head) {
		color: var(--ui-color-text-subtle);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	:global(.ui-data-table__cell) {
		color: var(--ui-color-text);
		font-size: 0.84rem;
		line-height: 1.45;
	}
	</style>
