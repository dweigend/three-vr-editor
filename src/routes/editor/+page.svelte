<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	import Bot from '@lucide/svelte/icons/bot';
	import Monitor from '@lucide/svelte/icons/monitor';
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';

	import { ToolbarButton } from '$lib/components';
	import CodeEditor from '$lib/features/editor/CodeEditor.svelte';
	import EditorAgentPanel from '$lib/features/editor/EditorAgentPanel.svelte';
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

	let agentPane: CollapsiblePaneApi | null = null;
	let previewPane: CollapsiblePaneApi | null = null;
	let isAgentCollapsed = $state(false);
	let isPreviewCollapsed = $state(false);
	let pendingAppliedEdit = $state<EditorAgentAppliedEdit | null>(null);
	let pendingAppliedEditToken = $state(0);
	let lastAppliedEditToken = $state(0);
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

<svelte:head>
	<title>Editor</title>
</svelte:head>

<section class="ui-screen ui-screen--workbench">
	<PaneGroup
		autoSaveId="editor-page-layout"
		class="ui-pane-group ui-pane-group--workbench"
		direction="horizontal"
	>
		<Pane class="ui-pane-slot" defaultSize={56} minSize={24}>
			<PaneGroup
				autoSaveId="editor-page-stack-layout"
				class="ui-pane-group ui-pane-group--stack"
				direction="vertical"
			>
				<Pane class="ui-pane-slot" defaultSize={68} minSize={18}>
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
										templates={stableData.templates}
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
					<EditorAgentPanel
						activeFileContext={workspaceState.activeFileContext}
						endpoint={resolve('/editor/agent')}
						hasActiveKey={stableData.hasActiveKey}
						initialMessages={stableData.initialEditorMessages}
						initialSessionReady={stableData.initialEditorSessionReady}
						modelName={stableData.modelName}
						onResponse={handleAgentResponse}
					/>
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
					<ThreePreview
						preview={workspaceState.preview}
						onErrorChange={workspaceState.handlePreviewErrorChange}
					/>
				</div>
			</section>
		</Pane>
	</PaneGroup>
</section>
