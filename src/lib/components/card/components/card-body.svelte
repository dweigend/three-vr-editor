<!--
	Purpose: Render the primary content section inside a shared card surface.
	Context: Cards on the first aligned screen need a consistent body wrapper for explanatory copy and metadata.
	Responsibility: Provide the card body wrapper and accept standard HTML div attributes.
	Boundaries: The component stays presentational and does not interpret its children.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { cardBodyClass } from '../card.svelte';
	import type { CardSectionProps } from '../types';

	let { children, class: className = '', ...restProps }: CardSectionProps = $props();
</script>

<div {...restProps} class={joinClassNames(cardBodyClass, className)}>
	{@render children?.()}
</div>
