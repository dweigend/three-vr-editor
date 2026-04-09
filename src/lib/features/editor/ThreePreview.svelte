<!--
	Purpose: Render the live Three preview for the editor workspace.
	Context: The editor rebuilds scene modules on the server and swaps them in the browser without a full page reload.
	Responsibility: Load the bundled module, mount it into the shared runtime, and surface build or runtime failures.
	Boundaries: This component does not fetch source files or decide when preview rebuilds should happen.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { createThreeRuntime } from '$lib/features/editor/create-three-runtime';
	import {
		loadThreePreviewModule,
		type LoadedThreePreviewModule
	} from '$lib/features/editor/load-three-preview-module';
	import { toPreviewRuntimeError } from '$lib/features/editor/preview-runtime-errors';
	import type { ThreePreviewBuildResult } from '$lib/features/editor/three-editor-types';
	import { toViewerError, type ViewerError } from '$lib/features/editor/three-viewer-errors';

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
		<p class="ui-empty-state">No preview available.</p>
	{/if}

	{#snippet failed(error)}
		<ThreeViewerErrorPanel error={toViewerError(error)} />
	{/snippet}
</svelte:boundary>
