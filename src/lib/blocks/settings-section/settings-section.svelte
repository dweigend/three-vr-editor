<!--
	Purpose: Render a reusable titled section shell for stacked settings screens.
	Context: Settings-like pages should stay vertically organized and avoid repeating header and spacing markup.
	Responsibility: Provide a consistent titled header, optional meta line, and padded content area.
	Boundaries: This component stays presentational and does not manage form submission or domain logic.
-->

<script lang="ts">
	import { joinClassNames } from '$lib/utils/class-names';

	import type { SettingsSectionProps } from './types';

	let {
		children,
		class: className = '',
		headerActions,
		icon,
		meta,
		title
	}: SettingsSectionProps = $props();
</script>

<section class={joinClassNames('ui-pane settings-section', className)}>
	<header class="ui-pane__header settings-section__header">
		<div class="settings-section__heading">
			{#if icon}
				<span class="settings-section__icon">
					{@render icon()}
				</span>
			{/if}

			<p class="ui-surface-label">{title}</p>
		</div>

		{#if meta || headerActions}
			<div class="settings-section__header-side">
				{#if meta}
					<p class="ui-toolbar-status">{meta}</p>
				{/if}

				{#if headerActions}
					<div class="settings-section__actions">
						{@render headerActions()}
					</div>
				{/if}
			</div>
		{/if}
	</header>

	<div class="ui-pane__body settings-section__body">
		{@render children?.()}
	</div>
</section>

<style>
	.settings-section {
		min-height: 0;
	}

	.settings-section__header {
		min-height: 3rem;
	}

	.settings-section__heading,
	.settings-section__header-side,
	.settings-section__actions {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-2);
		min-width: 0;
	}

	.settings-section__header-side {
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.settings-section__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--ui-color-accent-strong);
	}

	.settings-section__body {
		display: grid;
		gap: var(--ui-space-3);
	}
</style>
