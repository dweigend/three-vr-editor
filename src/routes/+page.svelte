<!--
	Purpose: Provide the top-level route hub for the current builder workflows.
	Context: The former demo index now lives directly at the root so the page tree stays one level flatter.
	Responsibility: Present the manual entrypoints for the Three, Pi, and editor smoke-test routes.
	Boundaries: The individual route pages still own their specific screen composition and behavior.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import { Card, CardBody, CardHeader } from '$lib/components';

	const routeGroups = [
		{
			label: 'Three demos',
			routes: [
				{
					href: resolve('/three'),
					title: 'Viewer smoke test',
					description: 'Managed cube scene and base runtime shell.'
				},
				{
					href: resolve('/three/editor'),
					title: 'Editor workspace',
					description: 'CodeMirror editing with live preview.'
				},
				{
					href: resolve('/three/editor/pi'),
					title: 'Editor + Pi',
					description: 'Shared editor workspace with Pi-assisted edits.'
				},
				{
					href: resolve('/three/editor/templates'),
					title: 'Template workbench',
					description: 'Template-driven scene creation and preview.'
				}
			]
		},
		{
			label: 'Pi demos',
			routes: [
				{
					href: resolve('/pi'),
					title: 'OpenRouter keys',
					description: 'Store, activate, and remove API keys.'
				},
				{
					href: resolve('/pi/models'),
					title: 'Model settings',
					description: 'Select the configured OpenRouter model.'
				},
				{
					href: resolve('/pi/chat'),
					title: 'Chat demo',
					description: 'Start a session and send prompt turns.'
				},
				{
					href: resolve('/editor'),
					title: 'Editor foundation',
					description: 'Small isolated editor baseline powered by CodeMirror.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>Three.js VR Builder</title>
</svelte:head>

<section class="ui-shell ui-grid">
	<div class="ui-stack ui-stack--tight">
		<p class="ui-surface-label">Route hub</p>
		<h1 class="ui-page-title">Demos</h1>
		<p class="ui-page-copy">Use this page as the primary manual entrypoint for all current builder routes.</p>
	</div>

	<div class="ui-grid ui-grid--cards">
		{#each routeGroups as group (group.label)}
			<Card>
				<CardHeader class="ui-stack ui-stack--tight">
					<p class="ui-surface-label">{group.label}</p>
				</CardHeader>
				<CardBody class="ui-panel-list">
					{#each group.routes as route (route.href)}
						<a class="ui-panel-link" href={route.href}>
							<h2 class="ui-panel-link__title">{route.title}</h2>
							<p class="ui-panel-link__copy">{route.description}</p>
						</a>
					{/each}
				</CardBody>
			</Card>
		{/each}
	</div>
</section>
