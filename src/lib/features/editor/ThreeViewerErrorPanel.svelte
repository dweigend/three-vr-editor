<!--
	Purpose: Render a readable inline error state for the local Three.js preview.
	Context: Viewer runtime and boundary failures should stay inside the preview area instead of crashing the route.
	Responsibility: Display the normalized message, optional source location, and stack details.
	Boundaries: This component does not transform errors or control retry behavior.
-->

<script lang="ts">
	import type { ViewerError } from '$lib/features/editor/three-viewer-errors';

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
