<!--
	Purpose: Provide the simplified root launcher for the current builder workflows.
	Context: The app now keeps only three primary user-facing surfaces: editor, chat, and settings.
	Responsibility: Present the main launch destinations without exposing legacy demo structure.
	Boundaries: The individual route pages still own their specific screen composition and behavior.
-->

<script lang="ts">
	import { resolve } from '$app/paths';
	import { AppLauncher } from '$lib/blocks';

	const launcherItems = [
		{
			href: resolve('/three/editor/pi'),
			title: 'Editor',
			description: 'Three.js preview, managed files, and Pi-assisted editing in one workspace.',
			actionLabel: 'Open editor',
			kicker: 'Build',
			meta: 'Preview + Pi'
		},
		{
			href: resolve('/pi/chat'),
			title: 'Chat',
			description: 'Start a Pi session and continue prompt turns against the active configuration.',
			actionLabel: 'Open chat',
			kicker: 'Talk',
			meta: 'Session-based'
		},
		{
			href: resolve('/pi'),
			title: 'Settings',
			description: 'Manage OpenRouter keys and choose the active model on one consolidated page.',
			actionLabel: 'Open settings',
			kicker: 'Configure',
			meta: 'Keys + model'
		}
	];
</script>

<svelte:head>
	<title>Three.js VR Builder</title>
</svelte:head>

<section class="ui-shell ui-stack">
	<AppLauncher
		items={launcherItems}
		kicker="Start"
		title="Workspace"
		description="Choose one of the three core surfaces: editor, chat, or settings."
	/>
</section>
