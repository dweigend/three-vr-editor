<!--
	Purpose: Render a reusable titled section shell for stacked settings screens.
	Context: Settings-like pages should stay vertically organized and avoid repeating header and spacing markup.
	Responsibility: Provide a consistent titled header, optional meta line, and padded content area.
	Boundaries: This component stays presentational and does not manage form submission or domain logic.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import type { SettingsSectionProps } from './types';

	let { children, class: className = '', meta, title }: SettingsSectionProps = $props();
</script>

<section class={joinClassNames('settings-section', className)}>
	<header class="settings-section__header">
		<p class="settings-section__title">{title}</p>

		{#if meta}
			<p class="settings-section__meta">{meta}</p>
		{/if}
	</header>

	<div class="settings-section__body">
		{@render children?.()}
	</div>
</section>

<style>
	.settings-section {
		border: 1px solid var(--ui-color-border);
		background: var(--ui-color-surface);
	}

	.settings-section__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--ui-space-3);
		padding: 0.95rem 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.settings-section__title,
	.settings-section__meta {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.settings-section__title {
		color: var(--ui-color-accent-strong);
	}

	.settings-section__meta {
		color: var(--ui-color-text-muted);
	}

	.settings-section__body {
		display: grid;
		gap: var(--ui-space-5);
		padding: 1.25rem;
	}
</style>
