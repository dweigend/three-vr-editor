<!--
	Purpose: Render a readable inline error state for the local Three.js demo viewer.
	Context: Viewer runtime and boundary failures should stay inside the preview area instead of crashing the route.
	Responsibility: Display the normalized message, optional source location, and stack details.
	Boundaries: This component does not transform errors or control retry behavior.
-->

<script lang="ts">
	import type { ViewerError } from '$lib/three/three-viewer-errors';

	type Props = {
		error: ViewerError;
	};

	let { error }: Props = $props();
</script>

<div class="error-panel" role="alert">
	<h3>{error.title}</h3>
	<p>{error.message}</p>

	{#if error.location}
		<p><strong>Location:</strong> <code>{error.location}</code></p>
	{/if}

	{#if error.source?.line}
		<p>
			<strong>Line:</strong> {error.source.line}{#if error.source.column}, Column: {error.source.column}{/if}
		</p>
	{/if}

	{#if error.stack}
		<pre>{error.stack}</pre>
	{/if}
</div>

<style>
	.error-panel {
		background: #fff1f2;
		border: 1px solid #fecdd3;
		border-radius: 0;
		color: #881337;
		padding: 1rem;
		font-size: var(--ui-font-size-body);
	}

	.error-panel h3 {
		margin: 0;
	}

	.error-panel p {
		margin: 0.5rem 0 0;
	}

	.error-panel pre {
		background: #fff;
		border: 1px solid #fecdd3;
		border-radius: 0;
		font-size: var(--ui-font-size-body);
		margin: 1rem 0 0;
		overflow-x: hidden;
		padding: 0.75rem;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
