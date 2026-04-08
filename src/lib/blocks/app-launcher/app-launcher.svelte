<!--
	Purpose: Render a compact launch surface for the application's main destinations.
	Context: The root page now exposes only the editor, chat, and settings flows and should stay thin.
	Responsibility: Compose reusable cards and actions into one clear entry grid.
	Boundaries: This block stays presentational and does not decide route permissions or app state.
-->

<script lang="ts">
	import { Button, Card, CardBody, CardFooter, CardHeader } from '$lib/components';
	import { joinClassNames } from '$lib/utils/class-names';

	import type { AppLauncherProps } from './types';

	let {
		class: className = '',
		description = '',
		items,
		kicker = 'Workspace',
		title
	}: AppLauncherProps = $props();
</script>

<section class={joinClassNames('ui-grid', className)}>
	<div class="ui-stack ui-stack--tight">
		<p class="ui-surface-label">{kicker}</p>
		<h1 class="ui-page-title">{title}</h1>
		{#if description}
			<p class="ui-page-copy">{description}</p>
		{/if}
	</div>

	<div class="ui-grid ui-grid--cards">
		{#each items as item (item.href)}
			<Card class="ui-screen ui-screen--fill">
				<CardHeader class="ui-stack ui-stack--tight">
					<p class="ui-surface-label">{item.kicker ?? 'Open'}</p>
					<h2 class="ui-panel-link__title">{item.title}</h2>
				</CardHeader>

				<CardBody class="ui-stack ui-stack--tight">
					<p class="ui-page-copy">{item.description}</p>
					{#if item.meta}
						<p class="ui-toolbar-status">{item.meta}</p>
					{/if}
				</CardBody>

				<CardFooter>
					<Button href={item.href}>{item.actionLabel ?? 'Open'}</Button>
				</CardFooter>
			</Card>
		{/each}
	</div>
</section>
