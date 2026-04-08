<!--
	Purpose: Render the additive Three template workbench inside the nested editor route tree.
	Context: This route showcases template-based scene creation and optional parameter controls without replacing prior demos.
	Responsibility: Provide route-level links and compose the dedicated template workbench component with server bootstrap data.
	Boundaries: File, preview, and parsing logic live in reusable library modules.
-->

<script lang="ts">
	import ThreeEditorTemplateWorkspace from '$lib/three/ThreeEditorTemplateWorkspace.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Three.js Editor Templates Demo</title>
</svelte:head>

<ThreeEditorTemplateWorkspace
	files={data.files}
	initialDocument={data.document}
	initialPreview={data.preview}
	previewEntryPath={data.previewEntryPath}
	templates={data.templates}
/>
