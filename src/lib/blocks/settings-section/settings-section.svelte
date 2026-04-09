<!-- Shared titled settings section. -->

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
