<!--
	Purpose: Compose the shared Three editor workspace with a Pi panel.
	Context: This additive demo extends the base editor flow through the nested `/three/editor/pi` route.
	Responsibility: Wire active-file context from the workspace into the local Pi agent panel UI.
	Boundaries: Editor orchestration and Pi server execution both live in dedicated library modules.
-->

<script lang="ts">
	import ThreeEditorPiWorkspace from '$lib/three/ThreeEditorPiWorkspace.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Three.js Editor + Pi Demo</title>
</svelte:head>

<ThreeEditorPiWorkspace
	files={data.files}
	hasActiveKey={data.hasActiveKey}
	initialDocument={data.document}
	initialEditorMessages={data.initialEditorMessages}
	initialEditorSessionReady={data.initialEditorSessionReady}
	initialPreview={data.preview}
	modelName={data.configuredModel.name}
	previewEntryPath={data.previewEntryPath}
/>
