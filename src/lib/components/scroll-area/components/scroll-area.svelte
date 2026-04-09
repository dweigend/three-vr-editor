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

<style>
	:global(.ui-scroll-area) {
		position: relative;
		overflow: hidden;
	}

	:global(.ui-scroll-area__viewport) {
		width: 100%;
		height: 100%;
	}

	:global(.ui-scroll-area__scrollbar) {
		display: flex;
		touch-action: none;
		user-select: none;
		background: rgba(255, 255, 255, 0.03);
		transition: background var(--ui-transition-fast);
	}

	:global(.ui-scroll-area__scrollbar[data-orientation='vertical']) {
		width: 0.55rem;
		padding: 0.08rem;
		border-left: 1px solid var(--ui-color-border);
	}

	:global(.ui-scroll-area__thumb) {
		flex: 1;
		border-radius: 999px;
		background: rgba(168, 85, 247, 0.42);
	}
	</style>
