<!--
	Purpose: Render a semantic table row with optional selected styling.
	Context: Compact data tables often need to highlight an active or selected row without route-local markup.
	Responsibility: Provide a typed wrapper around `<tr>` and expose a small selected state hook.
	Boundaries: This component stays presentational and does not manage interaction state.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { tableRowClass } from '../table.svelte';
	import type { TableRowProps } from '../types';

	let { children, class: className = '', selected = false, ...restProps }: TableRowProps = $props();
</script>

<tr
	{...restProps}
	class={joinClassNames(tableRowClass, className)}
	data-selected={selected ? 'true' : undefined}
>
	{@render children?.()}
</tr>
