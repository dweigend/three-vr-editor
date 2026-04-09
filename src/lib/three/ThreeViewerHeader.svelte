<!--
	Purpose: Render the small header area for the local Three.js demo viewer.
	Context: The viewer uses the same header structure in both normal and boundary-fallback states.
	Responsibility: Show the asset base label and an optional retry action.
	Boundaries: This component does not know anything about Three.js runtime setup or error normalization.
-->

<script lang="ts">
	type Props = {
		assetBaseUrl: string;
		onRetry?: (() => void) | undefined;
		showRetry: boolean;
	};

	let { assetBaseUrl, onRetry, showRetry }: Props = $props();
</script>

<div class="viewer-header">
	<div>
		<h2>Three.js Viewer</h2>
		<p>Static asset base: <code>{assetBaseUrl}</code></p>
	</div>

	{#if showRetry}
		<button type="button" class="retry-button" onclick={onRetry}>Retry</button>
	{/if}
</div>
