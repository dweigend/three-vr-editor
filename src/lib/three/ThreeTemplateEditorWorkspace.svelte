<!--
	Purpose: Compose the additive Three template workbench with file creation, dynamic parameter controls, code editing, and live preview.
	Context: This new demo route should extend the existing editor architecture without replacing the original editor or Pi-enhanced variants.
	Responsibility: Reuse the shared workspace state, wire in template-aware side panels, and keep scene selection preview-driven.
	Boundaries: Route-level headings and server-only file or preview endpoints live elsewhere.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	import CodeEditor from '$lib/editor/CodeEditor.svelte';
	import FileSelect from '$lib/editor/FileSelect.svelte';
	import type {
		ThreePreviewBuildResult,
		ThreeSourceDocument,
		ThreeSourceFileSummary
	} from '$lib/three/three-editor-types';
	import { createThreeEditorWorkspaceState } from '$lib/three/three-editor-workspace-state.svelte';
	import type { ThreeTemplateSummary } from '$lib/three/three-template-types';

	import ThreeFileCreatePanel from './ThreeFileCreatePanel.svelte';
	import ThreePreview from './ThreePreview.svelte';
	import ThreeTemplateParameterPanel from './ThreeTemplateParameterPanel.svelte';

	type Props = {
		files: ThreeSourceFileSummary[];
		initialDocument: ThreeSourceDocument;
		initialPreview: ThreePreviewBuildResult;
		previewEntryPath: string;
		templates: ThreeTemplateSummary[];
	};

	let { files, initialDocument, initialPreview, previewEntryPath, templates }: Props = $props();
	const stableFiles = untrack(() => files);
	const stableInitialDocument = untrack(() => initialDocument);
	const stableInitialPreview = untrack(() => initialPreview);
	const stablePreviewEntryPath = untrack(() => previewEntryPath);

	const workspaceState = createThreeEditorWorkspaceState({
		createFileEndpoint: resolve('/demo/three/editor/file/create'),
		fileEndpoint: resolve('/demo/three/editor/file'),
		files: stableFiles,
		initialDocument: stableInitialDocument,
		initialPreview: stableInitialPreview,
		previewEndpoint: resolve('/demo/three/editor/preview'),
		previewEntryPath: stablePreviewEntryPath,
		previewMode: 'selected'
	});
</script>

<div class="toolbar-row">
	<FileSelect files={workspaceState.files} bind:value={workspaceState.selectedPath} label="Workbench file" />
</div>

{#if workspaceState.saveError}
	<p>{workspaceState.saveError}</p>
{:else if workspaceState.saveState === 'saved'}
	<p>Saved.</p>
{/if}

<div class="workspace-grid">
	<div class="sidebar-column">
		<ThreeFileCreatePanel templates={templates} onCreate={workspaceState.createFile} />
		{#if workspaceState.activeDocument !== undefined}
			<ThreeTemplateParameterPanel
				source={workspaceState.activeDocument}
				onSourceChange={workspaceState.handleSourceChange}
			/>
		{/if}
	</div>

	<div class="workspace-column">
		{#if workspaceState.activeDocument === undefined}
			<p>Loading file...</p>
		{:else}
			{#key workspaceState.selectedPath}
				<CodeEditor
					changedLineRanges={workspaceState.changedLineRanges}
					diagnostic={workspaceState.activeDiagnostic}
					value={workspaceState.activeDocument}
					onChange={workspaceState.handleSourceChange}
					onSave={workspaceState.saveActiveDocument}
					saveDisabled={!workspaceState.isDirty || workspaceState.saveState === 'saving'}
				/>
			{/key}
		{/if}
	</div>

	<div class="workspace-column">
		<ThreePreview
			preview={workspaceState.preview}
			onErrorChange={workspaceState.handlePreviewErrorChange}
		/>
	</div>
</div>

<style>
	.toolbar-row {
		margin-bottom: 1rem;
	}

	.workspace-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: minmax(18rem, 22rem) minmax(0, 1.2fr) minmax(0, 1fr);
	}

	.sidebar-column,
	.workspace-column {
		display: grid;
		gap: 1rem;
		min-width: 0;
	}

	@media (max-width: 1280px) {
		.workspace-grid {
			grid-template-columns: 1fr 1fr;
		}

		.sidebar-column {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 900px) {
		.workspace-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
