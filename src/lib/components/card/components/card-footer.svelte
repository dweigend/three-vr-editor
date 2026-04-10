<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import { cardFooterClass } from '../card.svelte';
	import type { CardSectionProps } from '../types';

	let { children, class: className = '', ...restProps }: CardSectionProps = $props();
</script>

<div {...restProps} class={joinClassNames(cardFooterClass, className)}>
	{@render children?.()}
</div>
