<!--
	Purpose: Render the additive Three template workbench demo next to the existing editor milestones.
	Context: This route should showcase template-based scene creation and optional parameter controls without replacing prior demos.
	Responsibility: Provide route-level links and compose the dedicated template workbench component with server bootstrap data.
	Boundaries: File, preview, and parsing logic live in reusable library modules.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import ThreeTemplateEditorWorkspace from '$lib/three/ThreeTemplateEditorWorkspace.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Three.js Template Workbench Demo</title>
</svelte:head>

<h1>Three.js template workbench demo</h1>
<p><a href={resolve('/')}>Back to start</a></p>
<p><a href={resolve('/demo')}>Back to demos</a></p>
<p><a href={resolve('/demo/three')}>Open viewer demo</a></p>
<p><a href={resolve('/demo/three/editor')}>Open plain editor demo</a></p>
<p><a href={resolve('/demo/three/editor-agent')}>Open editor + Pi agent demo</a></p>

<ThreeTemplateEditorWorkspace
	files={data.files}
	initialDocument={data.document}
	initialPreview={data.preview}
	previewEntryPath={data.previewEntryPath}
	templates={data.templates}
/>
