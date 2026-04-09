<!--
	Purpose: Render a styled scroll-area wrapper based on Bits UI primitives.
	Context: Compact admin and settings surfaces need internal scrolling that follows the shared UI-system reference.
	Responsibility: Compose the Bits UI root, viewport, scrollbars, and thumb with local family styling.
	Boundaries: This component stays presentational and does not manage the surrounding panel layout.
-->

<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
	import { joinClassNames } from '$lib/utils/class-names';

	import {
		scrollAreaRootClass,
		scrollAreaScrollbarClass,
		scrollAreaThumbClass,
		scrollAreaViewportClass
	} from '../scroll-area.svelte';
	import type { ScrollAreaProps } from '../types';

	let {
		ref = $bindable(null),
		children,
		class: className = '',
		viewportClass = '',
		...restProps
	}: ScrollAreaProps = $props();
</script>

<ScrollAreaPrimitive.Root bind:ref {...restProps} class={joinClassNames(scrollAreaRootClass, className)}>
	<ScrollAreaPrimitive.Viewport class={joinClassNames(scrollAreaViewportClass, viewportClass)}>
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	<ScrollAreaPrimitive.Scrollbar class={scrollAreaScrollbarClass} orientation="vertical">
		<ScrollAreaPrimitive.Thumb class={scrollAreaThumbClass} />
	</ScrollAreaPrimitive.Scrollbar>
</ScrollAreaPrimitive.Root>
