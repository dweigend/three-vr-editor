<!--
	Purpose: Render the first isolated Three.js smoke-test route for the repository.
	Context: This route validates the viewer setup before any workbench or editor-preview coupling is added.
	Responsibility: Present the rotating-cube demo, document the static asset path, and link back to the existing demos.
	Boundaries: This page does not execute user-authored code or load real 3D assets yet.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import ThreeViewer from '$lib/three/ThreeViewer.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<h1>{data.title}</h1>
<p>{data.description}</p>
<p><a href={resolve('/')}>Back to start</a></p>
<p><a href={resolve('/demo')}>Back to demos</a></p>
<p><a href={resolve('/demo/three/editor')}>Open editor demo</a></p>
<p><a href={resolve('/demo/three/editor-agent')}>Open editor + Pi agent demo</a></p>
<p><a href={resolve('/demo/three/editor-templates')}>Open template workbench demo</a></p>
<p>Three static files live under <code>{data.assetBaseUrl}</code>.</p>
<p>The cube scene source lives in <code>{data.cubeSourceUrl}</code>.</p>

<ThreeViewer assetBaseUrl={data.assetBaseUrl} />
