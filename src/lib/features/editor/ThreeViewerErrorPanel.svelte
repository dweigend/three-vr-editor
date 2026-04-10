<script lang="ts">
	import type { ViewerError } from '$lib/features/editor/three-viewer-errors';
	import '$lib/features/editor/three-viewer-error-panel.css';

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
