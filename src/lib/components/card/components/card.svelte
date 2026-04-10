<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { cardRootClass } from '../card.svelte';
	import type { CardProps } from '../types';

	let { children, class: className = '', ...restProps }: CardProps = $props();
</script>

<div {...restProps} class={joinClassNames(cardRootClass, className)}>
	{@render children?.()}
</div>
