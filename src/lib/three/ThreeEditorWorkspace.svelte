<!--
	Purpose: Compose the reusable file picker, editor, and live Three preview workspace for editable demos.
	Context: Multiple routes should share the same local file/edit/preview orchestration without duplicating page logic.
	Responsibility: Manage selected-file state, in-memory edits, save actions, preview rebuilds, and active-file context.
	Boundaries: Route-specific headings, Pi agent UI, and server-side file or preview implementations live elsewhere.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	import CodeEditor from '$lib/editor/CodeEditor.svelte';
	import type { EditorAgentAppliedEdit } from '$lib/pi/editor-agent-types';
	import FileSelect from '$lib/editor/FileSelect.svelte';
	import ThreePreview from '$lib/three/ThreePreview.svelte';
	import type {
		ThreePreviewBuildResult,
		ThreeSourceDocument,
		ThreeSourceFileSummary
	} from '$lib/three/three-editor-types';
	import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';
	import { createThreeEditorWorkspaceState } from '$lib/three/three-editor-workspace-state.svelte';

	type Props = {
		activeFileContext?: ThreeEditorActiveFileContext | null;
		files: ThreeSourceFileSummary[];
		initialDocument: ThreeSourceDocument;
		initialPreview: ThreePreviewBuildResult;
		pendingAppliedEdit?: EditorAgentAppliedEdit | null;
		pendingAppliedEditToken?: number;
		previewEntryPath: string;
	};

	let {
		activeFileContext = $bindable<ThreeEditorActiveFileContext | null>(null),
		files,
		initialDocument,
		initialPreview,
		pendingAppliedEdit = null,
		pendingAppliedEditToken = 0,
		previewEntryPath
	}: Props = $props();
	let lastAppliedEditToken = $state(0);
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
		previewEntryPath: stablePreviewEntryPath
	});

	$effect(() => {
		activeFileContext = workspaceState.activeFileContext;
	});

	$effect(() => {
		if (!pendingAppliedEdit || pendingAppliedEditToken === lastAppliedEditToken) {
			return;
		}

		lastAppliedEditToken = pendingAppliedEditToken;

		if (pendingAppliedEdit.path !== workspaceState.selectedPath) {
			return;
		}

		workspaceState.applyDocumentUpdate(
			pendingAppliedEdit.content,
			pendingAppliedEdit.changedLineRanges
		);
		void workspaceState.saveActiveDocument();
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
			<FileSelect
				files={workspaceState.files}
				bind:value={workspaceState.selectedPath}
				label="Static Three file"
			/>
		</div>
		<div class="ui-toolbar__spacer"></div>
		<p class={toolbarStatus.className}>{toolbarStatus.text}</p>
	</div>

	<div class="ui-workbench ui-workbench--editor">
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
			<ThreePreview preview={workspaceState.preview} onErrorChange={workspaceState.handlePreviewErrorChange} />
		</section>
	</div>
</section>
