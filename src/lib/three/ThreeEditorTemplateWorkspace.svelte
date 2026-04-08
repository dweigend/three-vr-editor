<!--
	Purpose: Compose the additive Three template workbench with file creation, dynamic parameter controls, code editing, and live preview.
	Context: This nested editor route extends the existing editor architecture without replacing the original editor or Pi-enhanced variant.
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
		createFileEndpoint: resolve('/three/editor/file/create'),
		fileEndpoint: resolve('/three/editor/file'),
		files: stableFiles,
		initialDocument: stableInitialDocument,
		initialPreview: stableInitialPreview,
		previewEndpoint: resolve('/three/editor/preview'),
		previewEntryPath: stablePreviewEntryPath,
		previewMode: 'selected'
	});

	const toolbarStatus = $derived.by(() => {
		if (workspaceState.saveError) {
			return {
				className: 'ui-toolbar-status ui-toolbar-status--danger',
				text: workspaceState.saveError
			};
		}

		if (workspaceState.saveState === 'saving') {
			return {
				className: 'ui-toolbar-status ui-toolbar-status--warning',
				text: 'Saving'
			};
		}

		if (workspaceState.isDirty) {
			return {
				className: 'ui-toolbar-status ui-toolbar-status--warning',
				text: 'Unsaved changes'
			};
		}

		return {
			className: 'ui-toolbar-status ui-toolbar-status--success',
			text: 'Saved'
		};
	});
</script>

<section class="ui-screen ui-screen--workbench">
	<div class="ui-toolbar">
		<div class="ui-toolbar__group">
			<FileSelect files={workspaceState.files} bind:value={workspaceState.selectedPath} label="Workbench file" />
		</div>
		<div class="ui-toolbar__spacer"></div>
		<p class={toolbarStatus.className}>{toolbarStatus.text}</p>
	</div>

	<div class="ui-workbench ui-workbench--template">
		<div class="ui-workbench__column ui-sidebar-stack">
			<ThreeFileCreatePanel templates={templates} onCreate={workspaceState.createFile} />
			{#if workspaceState.activeDocument !== undefined}
				<ThreeTemplateParameterPanel
					source={workspaceState.activeDocument}
					onSourceChange={workspaceState.handleSourceChange}
				/>
			{/if}
		</div>

		<section class="ui-pane">
			<div class="ui-pane__body ui-pane__body--flush">
				{#if workspaceState.activeDocument === undefined}
					<div class="ui-pane__body">
						<p class="ui-empty-state">Loading file...</p>
					</div>
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
		</section>

		<section class="ui-pane ui-pane--plain ui-pane--muted">
			<ThreePreview
				preview={workspaceState.preview}
				onErrorChange={workspaceState.handlePreviewErrorChange}
			/>
		</section>
	</div>
</section>
