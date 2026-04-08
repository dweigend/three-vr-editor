<!--
	Purpose: Render the standalone Three editor demo by composing the shared editor workspace module.
	Context: The route should stay small while the reusable workspace logic can power additional editor variants.
	Responsibility: Provide route-specific headings and pass initial data into the shared workspace component.
	Boundaries: File selection, editor state, and preview orchestration live in the workspace module.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import ThreeEditorWorkspace from '$lib/three/ThreeEditorWorkspace.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Three.js Editor Demo</title>
</svelte:head>

<h1>Three.js editor demo</h1>
<p><a href={resolve('/')}>Back to start</a></p>
<p><a href={resolve('/demo')}>Back to demos</a></p>
<p><a href={resolve('/demo/three')}>Open viewer demo</a></p>
<p><a href={resolve('/demo/three/editor-agent')}>Open editor + Pi agent demo</a></p>
<p><a href={resolve('/demo/three/editor-templates')}>Open template workbench demo</a></p>

<ThreeEditorWorkspace
	files={data.files}
	initialDocument={data.document}
	initialPreview={data.preview}
	previewEntryPath={data.previewEntryPath}
/>
