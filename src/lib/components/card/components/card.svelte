<!--
	Purpose: Render the root shared card surface for grouped content.
	Context: The start screen needs a reusable, ui-system-aligned container before wider app adoption.
	Responsibility: Provide the base surface wrapper and accept standard HTML div attributes.
	Boundaries: This component stays generic and does not own content structure beyond the root container.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { cardRootClass } from '../card.svelte';
	import type { CardProps } from '../types';

	let { children, class: className = '', ...restProps }: CardProps = $props();
</script>

<div {...restProps} class={joinClassNames(cardRootClass, className)}>
	{@render children?.()}
</div>
