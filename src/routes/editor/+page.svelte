<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	import { Pane, PaneGroup, PaneResizer } from 'paneforge';

	import ControlPanel from '$lib/features/controlls/ControlPanel.svelte';
	import CodeEditor from '$lib/features/editor/CodeEditor.svelte';
	import EditorAgentPanel from '$lib/features/editor/EditorAgentPanel.svelte';
	import EditorWorkbenchToolbar from '$lib/features/editor/EditorWorkbenchToolbar.svelte';
	import {
		defaultEditorWorkbenchVisibility,
		editorWorkbenchPanels,
		normalizeWorkbenchVisibility,
		type EditorWorkbenchPanelKey
	} from '$lib/features/editor/editor-workbench';
	import type { CodeEditorToolbarState } from '$lib/features/editor/editor-workbench-types';
	import type { PiChatConversationMessage } from '$lib/features/chat/chat-types';
	import type {
		EditorAgentAppliedEdit,
		EditorAgentRequest,
		EditorAgentResponse
	} from '$lib/features/editor/editor-agent-types';
	import ThreePreview from '$lib/features/editor/ThreePreview.svelte';
	import type {
		ThreePreviewBuildResult,
		ThreeSourceDocument,
		ThreeSourceFileSummary
	} from '$lib/features/editor/three-editor-types';
	import { createThreeEditorWorkspaceState } from '$lib/features/editor/three-editor-workspace-state.svelte';
	import type { ThreeCreateFileRequest, ThreeTemplateSummary } from '$lib/features/editor/three-template-types';
	import NodeEditorPanel from '$lib/features/node-editor/NodeEditorPanel.svelte';
	import { joinClassNames } from '$lib/utils/class-names';

	import type { PageProps } from './$types';

	type CollapsiblePaneApi = {
		collapse: () => void;
		expand: () => void;
		isCollapsed: () => boolean;
	};

	let { data }: PageProps = $props();

	const stableData = untrack(() => {
		return {
			files: data.files as ThreeSourceFileSummary[],
			hasActiveKey: data.hasActiveKey,
			initialDocument: data.document as ThreeSourceDocument,
			initialEditorMessages: data.initialEditorMessages as PiChatConversationMessage[],
			initialEditorSessionReady: data.initialEditorSessionReady,
			initialPreview: data.preview as ThreePreviewBuildResult,
			modelName: data.configuredModel.name,
			previewEntryPath: data.previewEntryPath,
			templates: data.templates as ThreeTemplateSummary[]
		};
	});

	const workbenchPanelIds = Object.fromEntries(
		editorWorkbenchPanels.map((panel) => [panel.key, panel.panelId])
	) as Record<EditorWorkbenchPanelKey, string>;

	let controlsPane: CollapsiblePaneApi | null = null;
	let codePane: CollapsiblePaneApi | null = null;
	let agentPane: CollapsiblePaneApi | null = null;
	let nodeEditorPane: CollapsiblePaneApi | null = null;
	let previewPane: CollapsiblePaneApi | null = null;
	let codeEditorToolbarState = $state<CodeEditorToolbarState | null>(null);
	let pendingAppliedEdit = $state<EditorAgentAppliedEdit | null>(null);
	let pendingAppliedEditToken = $state(0);
	let lastAppliedEditToken = $state(0);
	let workbenchVisibility = $state<EditorWorkbenchPanelKey[]>([...defaultEditorWorkbenchVisibility]);
	let workspaceMessage = $state<string | null>(null);

	const workspaceState = createThreeEditorWorkspaceState({
		createFileEndpoint: resolve('/editor/file/create'),
		fileEndpoint: resolve('/editor/file'),
		files: stableData.files,
		initialDocument: stableData.initialDocument,
		initialPreview: stableData.initialPreview,
		previewEndpoint: resolve('/editor/preview'),
		previewEntryPath: stableData.previewEntryPath,
		previewMode: 'selected'
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

	async function handleCreateFile(request: ThreeCreateFileRequest): Promise<void> {
		try {
			await workspaceState.createFile(request);
			workspaceMessage = null;
		} catch (error) {
			workspaceMessage = error instanceof Error ? error.message : 'Create file failed.';
			throw error;
		}
	}

	function isWorkbenchPanelVisible(panelKey: EditorWorkbenchPanelKey): boolean {
		return workbenchVisibility.includes(panelKey);
	}

	function updateWorkbenchVisibility(nextVisibility: readonly EditorWorkbenchPanelKey[]): void {
		const normalizedVisibility = normalizeWorkbenchVisibility(nextVisibility);
		const hasVisibilityChanged =
			normalizedVisibility.length !== workbenchVisibility.length ||
			normalizedVisibility.some((panelKey, index) => panelKey !== workbenchVisibility[index]);

		if (hasVisibilityChanged) {
			workbenchVisibility = normalizedVisibility;
		}
	}

	function setWorkbenchPanelVisibility(
		panelKey: EditorWorkbenchPanelKey,
		visible: boolean
	): void {
		updateWorkbenchVisibility(
			visible
				? [...workbenchVisibility, panelKey]
				: workbenchVisibility.filter((visiblePanel) => visiblePanel !== panelKey)
		);
	}

	function handleWorkbenchPaneCollapse(panelKey: EditorWorkbenchPanelKey): void {
		setWorkbenchPanelVisibility(panelKey, false);
	}

	function handleWorkbenchPaneExpand(panelKey: EditorWorkbenchPanelKey): void {
		setWorkbenchPanelVisibility(panelKey, true);
	}

	function syncPaneVisibility(
		panelKey: EditorWorkbenchPanelKey,
		pane: CollapsiblePaneApi | null
	): void {
		if (!pane) {
			return;
		}

		const shouldBeVisible = isWorkbenchPanelVisible(panelKey);

		if (shouldBeVisible && pane.isCollapsed()) {
			pane.expand();
			return;
		}

		if (!shouldBeVisible && !pane.isCollapsed()) {
			pane.collapse();
		}
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

	const activeFileName = $derived.by(() => {
		const selectedPath = workspaceState.selectedPath;
		return selectedPath.split('/').at(-1) ?? selectedPath;
	});

	const saveDisabled = $derived(
		workspaceState.activeDocument === undefined ||
			!workspaceState.isDirty ||
			workspaceState.saveState === 'saving'
	);

	const canRedo = $derived(codeEditorToolbarState?.canRedo ?? false);

	$effect(() => {
		updateWorkbenchVisibility(workbenchVisibility);
		syncPaneVisibility('controls', controlsPane);
		syncPaneVisibility('code', codePane);
		syncPaneVisibility('agent', agentPane);
		syncPaneVisibility('node-editor', nodeEditorPane);
		syncPaneVisibility('preview', previewPane);
	});
</script>

<svelte:head>
	<title>Editor</title>
</svelte:head>

<section class="ui-screen ui-screen--workbench">
	<div class="ui-workbench">
		<EditorWorkbenchToolbar
			{canRedo}
			files={workspaceState.files}
			bind:selectedPath={workspaceState.selectedPath}
			onCreateFile={handleCreateFile}
			onRedo={() => {
				codeEditorToolbarState?.redo();
			}}
			onSave={workspaceState.saveActiveDocument}
			{saveDisabled}
			statusClassName={toolbarStatus.className}
			statusText={toolbarStatus.text}
			templates={stableData.templates}
			bind:windowVisibility={workbenchVisibility}
		/>

		<PaneGroup
			autoSaveId="editor-page-layout"
			class="ui-pane-group ui-pane-group--workbench"
			direction="horizontal"
		>
			<Pane
				bind:this={controlsPane}
				class="ui-pane-slot"
				collapsible={true}
				collapsedSize={0}
				defaultSize={16}
				minSize={12}
				onCollapse={() => handleWorkbenchPaneCollapse('controls')}
				onExpand={() => handleWorkbenchPaneExpand('controls')}
			>
				<ControlPanel activeFileName={activeFileName} panelId={workbenchPanelIds.controls} />
			</Pane>

			<PaneResizer
				class={joinClassNames(
					'ui-pane-resizer ui-pane-resizer--vertical',
					!isWorkbenchPanelVisible('controls') && 'ui-pane-resizer--hidden'
				)}
			/>

			<Pane class="ui-pane-slot" defaultSize={52} minSize={20}>
				<PaneGroup
					autoSaveId="editor-page-stack-layout"
					class="ui-pane-group ui-pane-group--stack"
					direction="vertical"
				>
					<Pane
						bind:this={codePane}
						class="ui-pane-slot"
						collapsible={true}
						collapsedSize={0}
						defaultSize={68}
						minSize={18}
						onCollapse={() => handleWorkbenchPaneCollapse('code')}
						onExpand={() => handleWorkbenchPaneExpand('code')}
					>
						<section class="ui-pane" id={workbenchPanelIds.code}>
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
											bind:toolbarState={codeEditorToolbarState}
											value={workspaceState.activeDocument}
											onChange={workspaceState.handleSourceChange}
										/>
									{/key}
								{/if}
							</div>
						</section>
					</Pane>

					<PaneResizer
						class={joinClassNames(
							'ui-pane-resizer ui-pane-resizer--horizontal',
							(!isWorkbenchPanelVisible('code') || !isWorkbenchPanelVisible('agent')) &&
								'ui-pane-resizer--hidden'
						)}
					/>

					<Pane
						bind:this={agentPane}
						class="ui-pane-slot"
						collapsible={true}
						collapsedSize={0}
						defaultSize={32}
						minSize={14}
						onCollapse={() => handleWorkbenchPaneCollapse('agent')}
						onExpand={() => handleWorkbenchPaneExpand('agent')}
					>
						<EditorAgentPanel
							activeFileContext={workspaceState.activeFileContext}
							endpoint={resolve('/editor/agent')}
							hasActiveKey={stableData.hasActiveKey}
							initialMessages={stableData.initialEditorMessages}
							initialSessionReady={stableData.initialEditorSessionReady}
							modelName={stableData.modelName}
							onResponse={handleAgentResponse}
							panelId={workbenchPanelIds.agent}
						/>
					</Pane>
				</PaneGroup>
			</Pane>

			<PaneResizer
				class={joinClassNames(
					'ui-pane-resizer ui-pane-resizer--vertical',
					!isWorkbenchPanelVisible('node-editor') && 'ui-pane-resizer--hidden'
				)}
			/>

			<Pane
				bind:this={nodeEditorPane}
				class="ui-pane-slot"
				collapsible={true}
				collapsedSize={0}
				defaultSize={18}
				minSize={12}
				onCollapse={() => handleWorkbenchPaneCollapse('node-editor')}
				onExpand={() => handleWorkbenchPaneExpand('node-editor')}
			>
				<NodeEditorPanel activeFileName={activeFileName} panelId={workbenchPanelIds['node-editor']} />
			</Pane>

			<PaneResizer
				class={joinClassNames(
					'ui-pane-resizer ui-pane-resizer--vertical',
					!isWorkbenchPanelVisible('preview') && 'ui-pane-resizer--hidden'
				)}
			/>

			<Pane
				bind:this={previewPane}
				class="ui-pane-slot"
				collapsible={true}
				collapsedSize={0}
				defaultSize={34}
				minSize={12}
				onCollapse={() => handleWorkbenchPaneCollapse('preview')}
				onExpand={() => handleWorkbenchPaneExpand('preview')}
			>
				<section class="ui-pane ui-pane--muted" id={workbenchPanelIds.preview}>
					<div class="ui-pane__header">
						<p class="ui-surface-label">Preview</p>
						<p class="ui-toolbar-status">Live render</p>
					</div>

					<div class="ui-pane__body ui-pane__body--flush">
						<ThreePreview
							preview={workspaceState.preview}
							onErrorChange={workspaceState.handlePreviewErrorChange}
						/>
					</div>
				</section>
			</Pane>
		</PaneGroup>
	</div>
</section>
