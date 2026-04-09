<!--
	Purpose: Host the minimal Three.js demo viewer and keep runtime failures inside the preview panel.
	Context: The first renderer integration should stay isolated from the rest of the SvelteKit app.
	Responsibility: Mount the Three runtime in the browser, show fallback UI on failures, and clean up on teardown.
	Boundaries: This component does not load arbitrary files or execute dynamic user-authored code yet.
-->

<script lang="ts">
	import ThreeViewerErrorPanel from '$lib/three/ThreeViewerErrorPanel.svelte';
	import ThreeViewerHeader from '$lib/three/ThreeViewerHeader.svelte';
	import { createThreeViewer } from '$lib/three/create-three-viewer';
	import { toViewerError, type ViewerError } from '$lib/three/three-viewer-errors';

	type Props = {
		assetBaseUrl: string;
	};

	let { assetBaseUrl }: Props = $props();

	let viewerRoot: HTMLDivElement | undefined = $state();
	let runtimeError: ViewerError | null = $state(null);

	function setViewerError(error: unknown, source: 'runtime' | 'boundary'): void {
		console.error(`ThreeViewer ${source} error`, error);
		runtimeError = toViewerError(error);
	}

	function handleBoundaryError(error: unknown): void {
		setViewerError(error, 'boundary');
	}

	function resetViewer(reset?: () => void): void {
		runtimeError = null;
		reset?.();
	}

	function retryViewer(): void {
		resetViewer();
	}

	$effect(() => {
		if (!viewerRoot || runtimeError) {
			return;
		}

		try {
			const viewer = createThreeViewer({
				container: viewerRoot,
				onRuntimeError: (error) => {
					setViewerError(error, 'runtime');
				}
			});

			return () => {
				viewer.dispose();
			};
		} catch (error) {
			setViewerError(error, 'runtime');
			return;
		}
	});
</script>

<svelte:boundary onerror={handleBoundaryError}>
	<div class="viewer-shell">
		<ThreeViewerHeader
			assetBaseUrl={assetBaseUrl}
			showRetry={Boolean(runtimeError)}
			onRetry={retryViewer}
		/>

		{#if runtimeError}
			<ThreeViewerErrorPanel error={runtimeError} />
		{:else}
			<div class="viewer-surface" bind:this={viewerRoot}></div>
		{/if}
	</div>

	{#snippet failed(error, reset)}
		{@const viewerError = toViewerError(error)}
		<div class="viewer-shell">
			<ThreeViewerHeader
				assetBaseUrl={assetBaseUrl}
				showRetry={true}
				onRetry={() => resetViewer(reset)}
			/>
			<ThreeViewerErrorPanel error={viewerError} />
		</div>
	{/snippet}
</svelte:boundary>

<style>
	.viewer-shell {
		display: grid;
		gap: 1rem;
	}

	.viewer-surface {
		background: #020617;
		border: 1px solid var(--ui-color-border);
		border-radius: 0;
		min-height: 28rem;
		overflow: hidden;
	}

	.viewer-surface :global(canvas) {
		display: block;
		height: 100%;
		width: 100%;
	}
</style>
