<!--
	Purpose: Render the header section inside a shared card surface.
	Context: Cards on the first aligned screen need a consistent top area for titles and summaries.
	Responsibility: Provide the card header wrapper and accept standard HTML div attributes.
	Boundaries: The component stays presentational and does not interpret its children.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { cardHeaderClass } from '../card.svelte';
	import type { CardSectionProps } from '../types';

	let { children, class: className = '', ...restProps }: CardSectionProps = $props();
</script>

<div {...restProps} class={joinClassNames(cardHeaderClass, className)}>
	{@render children?.()}
</div>
