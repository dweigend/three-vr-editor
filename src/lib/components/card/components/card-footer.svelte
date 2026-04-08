<!--
	Purpose: Render the footer section inside a shared card surface.
	Context: Cards on the first aligned screen need a consistent action row without repeating layout markup.
	Responsibility: Provide the card footer wrapper and accept standard HTML div attributes.
	Boundaries: The component stays presentational and does not interpret its children.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { cardFooterClass } from '../card.svelte';
	import type { CardSectionProps } from '../types';

	let { children, class: className = '', ...restProps }: CardSectionProps = $props();
</script>

<div {...restProps} class={joinClassNames(cardFooterClass, className)}>
	{@render children?.()}
</div>
