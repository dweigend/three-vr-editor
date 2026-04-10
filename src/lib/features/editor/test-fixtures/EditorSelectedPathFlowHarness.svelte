<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	import ControlPanel from '$lib/features/controlls/ControlPanel.svelte';

	import { editorLiveLayer } from '../editor-live-layer.svelte';
	import { createThreeEditorWorkspaceState } from '../three-editor-workspace-state.svelte';
	import {
		createPreviewBuildResult,
		rangeScenePath,
		rangeTemplateSource,
		selectedPathFlowFiles,
		selectScenePath,
		plainScenePath
	} from './editor-selected-path-flow-fixture';

	const workspaceState = createThreeEditorWorkspaceState({
		createFileEndpoint: '/editor/file/create',
		fileEndpoint: '/editor/file',
		files: selectedPathFlowFiles,
		initialDocument: {
			content: rangeTemplateSource,
			path: rangeScenePath
		},
		initialPreview: createPreviewBuildResult(rangeScenePath),
		previewEndpoint: '/editor/preview',
		previewEntryPath: rangeScenePath,
		previewMode: 'selected'
	});

	let panelVisible = $state(true);

	const activeFileName = $derived.by(() => {
		const selectedPath = workspaceState.selectedPath;
		return selectedPath.split('/').at(-1) ?? selectedPath;
	});

	$effect(() => {
		const activeFileContext = workspaceState.activeFileContext;

		untrack(() => {
			editorLiveLayer.syncActiveFileContext(activeFileContext);
		});
	});

	$effect(() => {
		const controlsVisible = panelVisible;

		untrack(() => {
			editorLiveLayer.setConsumerActive('control-panel', controlsVisible);
		});
	});

	onDestroy(() => {
		editorLiveLayer.reset();
	});

	function setFirstOverride(): void {
		if (editorLiveLayer.activePath !== rangeScenePath) {
			return;
		}

		editorLiveLayer.setOverride('cubeSize', 1.5);
	}
</script>

<button type="button" onclick={() => (workspaceState.selectedPath = selectScenePath)}>Open select file</button>
<button type="button" onclick={() => (workspaceState.selectedPath = plainScenePath)}>Open plain file</button>
<button type="button" onclick={() => (panelVisible = !panelVisible)}>
	{panelVisible ? 'Hide controls' : 'Show controls'}
</button>
<button type="button" onclick={setFirstOverride}>Set override</button>

{#if panelVisible}
	<ControlPanel activeFileName={activeFileName} panelId="test-control-panel" />
{/if}
