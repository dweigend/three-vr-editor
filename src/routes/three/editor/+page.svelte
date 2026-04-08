<!--
	Purpose: Render the standalone Three editor demo by composing the shared editor workspace module.
	Context: The route should stay small while the reusable workspace logic can power additional editor variants.
	Responsibility: Provide route-specific headings and pass initial data into the shared workspace component.
	Boundaries: File selection, editor state, and preview orchestration live in the workspace module.
-->

<script lang="ts">
	import ThreeEditorWorkspace from '$lib/three/ThreeEditorWorkspace.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Three.js Editor Demo</title>
</svelte:head>

<ThreeEditorWorkspace
	files={data.files}
	initialDocument={data.document}
	initialPreview={data.preview}
	previewEntryPath={data.previewEntryPath}
/>
