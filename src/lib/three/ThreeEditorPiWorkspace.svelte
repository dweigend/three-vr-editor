<!--
	Purpose: Compose the shared Three editor state with a dedicated Pi pane and a preview pane.
	Context: The nested editor Pi route needs a stable three-pane workbench that matches the wireframe without route-level layout glue.
	Responsibility: Manage the editor state, pass active-file context into Pi, and apply returned edits back into the active document.
	Boundaries: Pi transport stays inside the Pi panel and server routes, while route-level data loading stays outside this component.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import Bot from '@lucide/svelte/icons/bot';
	import Monitor from '@lucide/svelte/icons/monitor';
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';

	import { ToolbarButton } from '$lib/components';
	import CodeEditor from '$lib/editor/CodeEditor.svelte';
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
	import { joinClassNames } from '$lib/utils/class-names';

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

	type CollapsiblePaneApi = {
		collapse: () => void;
		expand: () => void;
		isCollapsed: () => boolean;
	};

	let agentPane: CollapsiblePaneApi | null = null;
	let previewPane: CollapsiblePaneApi | null = null;
	let isAgentCollapsed = $state(false);
	let isPreviewCollapsed = $state(false);
	let pendingAppliedEdit = $state<EditorAgentAppliedEdit | null>(null);
	let pendingAppliedEditToken = $state(0);
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

	function handleAgentResponse(event: {
		request: EditorAgentRequest;
		response: EditorAgentResponse;
	}): void {
		workspaceMessage = null;
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
	<PaneGroup autoSaveId="three-editor-pi-layout" class="ui-pane-group ui-pane-group--workbench" direction="horizontal">
		<Pane class="ui-pane-slot" defaultSize={56} minSize={24}>
			<PaneGroup
				autoSaveId="three-editor-pi-stack-layout"
				class="ui-pane-group ui-pane-group--stack"
				direction="vertical"
			>
				<Pane
					class="ui-pane-slot"
					defaultSize={68}
					minSize={18}
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
										aria-label={isAgentCollapsed ? 'Expand Pi agent pane' : 'Collapse Pi agent pane'}
										class={joinClassNames(
											'ui-code-editor__toolbar-button ui-code-editor__toolbar-button--icon',
											!isAgentCollapsed && 'ui-toolbar-button--active'
										)}
										onclick={() => {
											togglePane(agentPane);
										}}
										title={isAgentCollapsed ? 'Expand Pi agent pane' : 'Collapse Pi agent pane'}
									>
										<Bot aria-hidden="true" size={16} />
									</ToolbarButton>

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
						'ui-pane-resizer ui-pane-resizer--horizontal',
						isAgentCollapsed && 'ui-pane-resizer--hidden'
					)}
				/>

				<Pane
					bind:this={agentPane}
					class="ui-pane-slot"
					collapsible={true}
					collapsedSize={0}
					defaultSize={32}
					minSize={14}
					onCollapse={() => {
						isAgentCollapsed = true;
					}}
					onExpand={() => {
						isAgentCollapsed = false;
					}}
				>
					{#key workspaceState.activeFileContext?.path ?? 'no-file'}
						<EditorAgentPanel
							activeFileContext={workspaceState.activeFileContext}
							{hasActiveKey}
							{modelName}
							onResponse={handleAgentResponse}
						/>
					{/key}
				</Pane>
			</PaneGroup>
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
			defaultSize={44}
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
