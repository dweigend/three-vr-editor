<!--
	Purpose: Render a live Three.js preview from bundled module code while isolating build and runtime failures.
	Context: The editor demo needs a reusable preview surface that can swap scene modules without page reloads.
	Responsibility: Load bundled preview code, mount the scene into a Three runtime, and display readable inline errors.
	Boundaries: This component does not fetch files or decide when preview rebuilds should happen.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { createThreeRuntime } from '$lib/three/create-three-runtime';
	import {
		loadThreePreviewModule,
		type LoadedThreePreviewModule
	} from '$lib/three/load-three-preview-module';
	import { toPreviewRuntimeError } from '$lib/three/preview-runtime-errors';
	import type { ThreePreviewBuildResult } from '$lib/three/three-editor-types';
	import { toViewerError, type ViewerError } from '$lib/three/three-viewer-errors';

	import ThreeViewerErrorPanel from './ThreeViewerErrorPanel.svelte';

	type Props = {
		onErrorChange?: ((error: ViewerError | null) => void) | undefined;
		preview: ThreePreviewBuildResult | null;
	};

	let { onErrorChange, preview }: Props = $props();

	let previewModule: LoadedThreePreviewModule | null = $state(null);
	let previewError: ViewerError | null = $state(null);
	let runtimeError: ViewerError | null = $state(null);
	let viewerRoot: HTMLDivElement | undefined = $state();

	const activeError = $derived(previewError ?? runtimeError);

	function setRuntimeError(error: unknown, source: 'module' | 'runtime' | 'boundary'): void {
		console.error(`ThreePreview ${source} error`, error);
		runtimeError =
			source === 'boundary' || !previewModule
				? toViewerError(error)
				: toPreviewRuntimeError(error, {
						moduleUrl: previewModule.moduleUrl,
						sourceMap: previewModule.sourceMap
					});
	}

	function handleBoundaryError(error: unknown): void {
		setRuntimeError(error, 'boundary');
	}

	function disposePreviewModule(): void {
		previewModule?.dispose();
		previewModule = null;
	}

	$effect(() => {
		runtimeError = null;
		untrack(() => {
			disposePreviewModule();
		});

		if (!preview) {
			previewError = null;
			return;
		}

		if (preview.status === 'error') {
			previewError = preview.error;
			return;
		}

		previewError = null;

		let isCancelled = false;

		void (async () => {
			try {
				const nextPreviewModule = await loadThreePreviewModule(preview);

				if (isCancelled) {
					nextPreviewModule.dispose();
					return;
				}

				previewModule = nextPreviewModule;
			} catch (error) {
				if (!isCancelled) {
					previewError = toViewerError(error);
					console.error('ThreePreview module error', error);
				}
			}
		})();

		return () => {
			isCancelled = true;
			untrack(() => {
				disposePreviewModule();
			});
		};
	});

	$effect(() => {
		onErrorChange?.(activeError);
	});

	$effect(() => {
		if (!viewerRoot || !previewModule || activeError) {
			return;
		}

		try {
			const runtime = createThreeRuntime({
				container: viewerRoot,
				onRuntimeError: (error) => {
					setRuntimeError(error, 'runtime');
				},
				sceneFactory: previewModule.sceneFactory
			});

			return () => {
				runtime.dispose();
			};
		} catch (error) {
			setRuntimeError(error, 'runtime');
			return;
		}
	});
</script>

<svelte:boundary onerror={handleBoundaryError}>
	{#if activeError}
		<ThreeViewerErrorPanel error={activeError} />
	{:else if preview}
		<div class="preview-surface" bind:this={viewerRoot}></div>
	{:else}
		<p>No preview available.</p>
	{/if}

	{#snippet failed(error)}
		<ThreeViewerErrorPanel error={toViewerError(error)} />
	{/snippet}
</svelte:boundary>

<style>
	.preview-surface {
		min-height: 24rem;
		min-width: 0;
		overflow: hidden;
	}

	.preview-surface :global(canvas) {
		display: block;
		height: 100%;
		width: 100%;
	}
</style>
