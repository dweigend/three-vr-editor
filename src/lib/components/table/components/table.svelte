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
