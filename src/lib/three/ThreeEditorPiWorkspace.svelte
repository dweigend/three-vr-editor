<!--
	Purpose: Compose the shared Three editor state with a dedicated Pi pane and a preview pane.
	Context: The nested editor Pi route needs a stable three-pane workbench that matches the wireframe without route-level layout glue.
	Responsibility: Manage the editor state, pass active-file context into Pi, and apply returned edits back into the active document.
	Boundaries: Pi transport stays inside the Pi panel and server routes, while route-level data loading stays outside this component.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	import CodeEditor from '$lib/editor/CodeEditor.svelte';
	import FileSelect from '$lib/editor/FileSelect.svelte';
	import EditorAgentPanel from '$lib/pi/EditorAgentPanel.svelte';
	import type {
		EditorAgentAppliedEdit,
		EditorAgentRequest,
		EditorAgentResponse
	} from '$lib/pi/editor-agent-types';
	import type {
		ThreePreviewBuildResult,
		ThreeSourceDocument,
		ThreeSourceFileSummary
	} from '$lib/three/three-editor-types';
	import { createThreeEditorWorkspaceState } from '$lib/three/three-editor-workspace-state.svelte';

	import ThreePreview from './ThreePreview.svelte';

	type Props = {
		files: ThreeSourceFileSummary[];
		hasActiveKey: boolean;
		initialDocument: ThreeSourceDocument;
		initialPreview: ThreePreviewBuildResult;
		modelName?: string | null;
		previewEntryPath: string;
	};

	let {
		files,
		hasActiveKey,
		initialDocument,
		initialPreview,
		modelName = null,
		previewEntryPath
	}: Props = $props();

	let pendingAppliedEdit = $state<EditorAgentAppliedEdit | null>(null);
	let pendingAppliedEditToken = $state(0);
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

	function handleAgentResponse(event: {
		request: EditorAgentRequest;
		response: EditorAgentResponse;
	}): void {
		const appliedEdit = event.response.appliedEdit;
		const activeFileContext = workspaceState.activeFileContext;

		if (
			!appliedEdit ||
			!activeFileContext ||
			event.request.file.path !== activeFileContext.path ||
			event.request.file.content !== activeFileContext.content
		) {
			return;
		}

		pendingAppliedEdit = appliedEdit;
		pendingAppliedEditToken += 1;
	}

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

	<div class="ui-workbench ui-workbench--editor-pi">
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

		{#key workspaceState.activeFileContext?.path ?? 'no-file'}
			<EditorAgentPanel
				activeFileContext={workspaceState.activeFileContext}
				{hasActiveKey}
				{modelName}
				onResponse={handleAgentResponse}
			/>
		{/key}

		<section class="ui-pane ui-pane--plain ui-pane--muted">
			<ThreePreview preview={workspaceState.preview} onErrorChange={workspaceState.handlePreviewErrorChange} />
		</section>
	</div>
</section>
