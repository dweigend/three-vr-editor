<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';
	import { statusDotRootClass, statusDotToneClassByTone } from '../status-dot.svelte';
	import type { StatusDotProps } from '../types';

	let {
		class: className = '',
		decorative = false,
		label,
		tone = 'default',
		...restProps
	}: StatusDotProps = $props();
</script>

<span
	{...restProps}
	aria-hidden={decorative || undefined}
	aria-label={!decorative ? label : undefined}
	class={joinClassNames(statusDotRootClass, statusDotToneClassByTone[tone], className)}
	data-tone={tone}
	role={!decorative && label ? 'img' : undefined}
></span>
