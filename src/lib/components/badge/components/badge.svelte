<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';
	import { badgeRootClass, badgeToneClassByTone } from '../badge.svelte';
	import type { BadgeProps } from '../types';

	let {
		children,
		class: className = '',
		tone = 'default',
		...restProps
	}: BadgeProps = $props();
</script>

<span
	{...restProps}
	class={joinClassNames(badgeRootClass, badgeToneClassByTone[tone], className)}
	data-tone={tone}
>
	{@render children?.()}
</span>
