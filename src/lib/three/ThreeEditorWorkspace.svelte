<!--
	Purpose: Compose the reusable file picker, editor, and live Three preview workspace for editable demos.
	Context: Multiple routes should share the same local file/edit/preview orchestration without duplicating page logic.
	Responsibility: Manage selected-file state, in-memory edits, save actions, preview rebuilds, and active-file context.
	Boundaries: Route-specific headings, Pi agent UI, and server-side file or preview implementations live elsewhere.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import Monitor from '@lucide/svelte/icons/monitor';
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';

	import { ToolbarButton } from '$lib/components';
	import CodeEditor from '$lib/editor/CodeEditor.svelte';
	import type { EditorAgentAppliedEdit } from '$lib/pi/editor-agent-types';
	import ThreePreview from '$lib/three/ThreePreview.svelte';
	import type {
		ThreePreviewBuildResult,
		ThreeSourceDocument,
		ThreeSourceFileSummary
	} from '$lib/three/three-editor-types';
	import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';
	import { createThreeEditorWorkspaceState } from '$lib/three/three-editor-workspace-state.svelte';
	import { joinClassNames } from '$lib/utils/class-names';

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
	type CollapsiblePaneApi = {
		collapse: () => void;
		expand: () => void;
		isCollapsed: () => boolean;
	};

	let previewPane: CollapsiblePaneApi | null = null;
	let isPreviewCollapsed = $state(false);
	let lastAppliedEditToken = $state(0);
	let workspaceMessage = $state<string | null>(null);
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

	async function handleCreateFile(fileName: string): Promise<void> {
		try {
			await workspaceState.createFile({
				fileName,
				mode: 'blank'
			});
			workspaceMessage = null;
		} catch (error) {
			workspaceMessage = error instanceof Error ? error.message : 'Create file failed.';
			throw error;
		}
	}

	function togglePane(pane: CollapsiblePaneApi | null): void {
		if (!pane) {
			return;
		}

		if (pane.isCollapsed()) {
			pane.expand();
			return;
		}

		pane.collapse();
	}

	const toolbarStatus = $derived.by(() => {
		if (workspaceMessage) {
			return {
				className: 'ui-toolbar-status ui-toolbar-status--danger',
				text: workspaceMessage
			};
		}

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
	<PaneGroup autoSaveId="three-editor-layout" class="ui-pane-group ui-pane-group--workbench" direction="horizontal">
		<Pane
			class="ui-pane-slot"
			defaultSize={52}
			minSize={20}
		>
			<section class="ui-pane">
				<div class="ui-pane__body ui-pane__body--flush">
					{#if workspaceState.activeDocument === undefined}
						<div class="ui-pane__body">
							<p class="ui-empty-state">Loading file...</p>
						</div>
					{:else}
						{#snippet editorToolbarActions()}
							<ToolbarButton
								aria-label={isPreviewCollapsed ? 'Expand preview pane' : 'Collapse preview pane'}
								class={joinClassNames(
									'ui-code-editor__toolbar-button ui-code-editor__toolbar-button--icon',
									!isPreviewCollapsed && 'ui-toolbar-button--active'
								)}
								onclick={() => {
									togglePane(previewPane);
								}}
								title={isPreviewCollapsed ? 'Expand preview pane' : 'Collapse preview pane'}
							>
								<Monitor aria-hidden="true" size={16} />
							</ToolbarButton>
						{/snippet}

						{#key workspaceState.selectedPath}
							<CodeEditor
								changedLineRanges={workspaceState.changedLineRanges}
								diagnostic={workspaceState.activeDiagnostic}
								files={workspaceState.files}
								bind:selectedPath={workspaceState.selectedPath}
								onCreateFile={handleCreateFile}
								value={workspaceState.activeDocument}
								onChange={workspaceState.handleSourceChange}
								onSave={workspaceState.saveActiveDocument}
								saveDisabled={!workspaceState.isDirty || workspaceState.saveState === 'saving'}
								statusClassName={toolbarStatus.className}
								statusText={toolbarStatus.text}
								toolbarActions={editorToolbarActions}
							/>
						{/key}
					{/if}
				</div>
			</section>
		</Pane>

		<PaneResizer
			class={joinClassNames(
				'ui-pane-resizer ui-pane-resizer--vertical',
				isPreviewCollapsed && 'ui-pane-resizer--hidden'
			)}
		/>

		<Pane
			bind:this={previewPane}
			class="ui-pane-slot"
			collapsible={true}
			collapsedSize={0}
			defaultSize={48}
			minSize={12}
			onCollapse={() => {
				isPreviewCollapsed = true;
			}}
			onExpand={() => {
				isPreviewCollapsed = false;
			}}
		>
			<section class="ui-pane ui-pane--muted">
				<div class="ui-pane__header">
					<p class="ui-surface-label">Preview</p>
					<p class="ui-toolbar-status">Live render</p>
				</div>

				<div class="ui-pane__body ui-pane__body--flush">
					<ThreePreview preview={workspaceState.preview} onErrorChange={workspaceState.handlePreviewErrorChange} />
				</div>
			</section>
		</Pane>
	</PaneGroup>
</section>
