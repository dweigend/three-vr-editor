<!--
	Purpose: Compose the shared Three editor workspace with a Pi agent panel.
	Context: This additive demo should extend the existing editor flow without changing the original route.
	Responsibility: Wire active-file context from the workspace into the local Pi agent panel UI.
	Boundaries: Editor orchestration and Pi server execution both live in dedicated library modules.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import PiAgentPanel from '$lib/pi/PiAgentPanel.svelte';
	import type { PiEditorAgentAppliedEdit, PiEditorAgentRequest, PiEditorAgentResponse } from '$lib/pi/pi-editor-agent-types';
	import ThreeEditorWorkspace from '$lib/three/ThreeEditorWorkspace.svelte';
	import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let activeFileContext = $state<ThreeEditorActiveFileContext | null>(null);
	let pendingAppliedEdit = $state<PiEditorAgentAppliedEdit | null>(null);
	let pendingAppliedEditToken = $state(0);

	function handleAgentResponse(event: {
		request: PiEditorAgentRequest;
		response: PiEditorAgentResponse;
	}): void {
		const appliedEdit = event.response.appliedEdit;

		if (
			!appliedEdit ||
			!activeFileContext ||
			event.request.file.path !== activeFileContext.path ||
			event.request.file.content !== activeFileContext.content
		) {
			return;
		}

		pendingAppliedEdit = appliedEdit;
		pendingAppliedEditToken += 1;
	}
</script>

<svelte:head>
	<title>Three.js Editor + Pi Agent Demo</title>
</svelte:head>

<h1>Three.js editor + Pi agent demo</h1>
<p><a href={resolve('/')}>Back to start</a></p>
<p><a href={resolve('/demo')}>Back to demos</a></p>
<p><a href={resolve('/demo/three')}>Open viewer demo</a></p>
<p><a href={resolve('/demo/three/editor')}>Open plain editor demo</a></p>
<p><a href={resolve('/demo/three/editor-templates')}>Open template workbench demo</a></p>

<div class="page-grid">
	<div class="workspace-column">
		<ThreeEditorWorkspace
			bind:activeFileContext
			files={data.files}
			initialDocument={data.document}
			initialPreview={data.preview}
			{pendingAppliedEdit}
			{pendingAppliedEditToken}
			previewEntryPath={data.previewEntryPath}
		/>
	</div>

	<div class="agent-column">
		{#key activeFileContext?.path ?? 'no-file'}
			<PiAgentPanel
				{activeFileContext}
				hasActiveKey={data.hasActiveKey}
				modelName={data.configuredModel.name}
				onResponse={handleAgentResponse}
			/>
		{/key}
	</div>
</div>

<style>
	.page-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: minmax(0, 2fr) minmax(18rem, 1fr);
	}

	.workspace-column,
	.agent-column {
		min-width: 0;
	}

	@media (max-width: 1100px) {
		.page-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
