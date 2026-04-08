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
	import type { EditorDiagnostic, EditorLineRange } from '$lib/editor/editor-diagnostics';
	import type { PiEditorAgentAppliedEdit } from '$lib/pi/pi-editor-agent-types';
	import FileSelect from '$lib/editor/FileSelect.svelte';
	import ThreePreview from '$lib/three/ThreePreview.svelte';
	import type { ViewerError } from '$lib/three/three-viewer-errors';
	import type {
		ThreePreviewBuildResult,
		ThreeSourceDocument,
		ThreeSourceFileSummary
	} from '$lib/three/three-editor-types';
	import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';
	import { toViewerError } from '$lib/three/three-viewer-errors';

	type Props = {
		activeFileContext?: ThreeEditorActiveFileContext | null;
		files: ThreeSourceFileSummary[];
		initialDocument: ThreeSourceDocument;
		initialPreview: ThreePreviewBuildResult;
		pendingAppliedEdit?: PiEditorAgentAppliedEdit | null;
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
	const stableInitialDocument = untrack(() => initialDocument);
	const stableInitialPreview = untrack(() => initialPreview);

	let documents = $state<Record<string, string>>({
		[stableInitialDocument.path]: stableInitialDocument.content
	});
	let preview = $state<ThreePreviewBuildResult | null>(stableInitialPreview);
	let previewSurfaceError = $state<ViewerError | null>(
		stableInitialPreview.status === 'error' ? stableInitialPreview.error : null
	);
	let saveError = $state<string | null>(null);
	let saveState = $state<'idle' | 'saving' | 'saved'>('idle');
	let savedDocuments = $state<Record<string, string>>({
		[stableInitialDocument.path]: stableInitialDocument.content
	});
	let selectedPath = $state(stableInitialDocument.path);
	let previewRequestId = 0;
	let changedLineRanges = $state<EditorLineRange[]>([]);
	let lastAppliedEditToken = $state(0);

	const activeDocument = $derived(documents[selectedPath]);
	const activeSavedDocument = $derived(savedDocuments[selectedPath] ?? '');
	const isDirty = $derived((documents[selectedPath] ?? '') !== (savedDocuments[selectedPath] ?? ''));
	const activeDiagnostic = $derived.by<EditorDiagnostic | null>(() => {
		const error = previewSurfaceError;
		const source = previewSurfaceError?.source;

		if (!error || !source?.filePath || !source.line || source.filePath !== selectedPath) {
			return null;
		}

		return {
			column: source.column,
			line: source.line,
			message: error.message,
			path: source.filePath
		};
	});

	$effect(() => {
		const filePath = selectedPath;

		if (documents[filePath] !== undefined) {
			return;
		}

		let isCancelled = false;

		void (async () => {
			const response = await fetch(
				`${resolve('/demo/three/editor/file')}?path=${encodeURIComponent(filePath)}`
			);

			if (!response.ok) {
				return;
			}

			const document = (await response.json()) as ThreeSourceDocument;

			if (isCancelled) {
				return;
			}

			documents = {
				...documents,
				[document.path]: document.content
			};
			savedDocuments = {
				...savedDocuments,
				[document.path]: document.content
			};
		})();

		return () => {
			isCancelled = true;
		};
	});

	$effect(() => {
		if (activeDocument === undefined) {
			return;
		}

		const requestId = ++previewRequestId;
		const requestBody = {
			entryPath: previewEntryPath,
			files: Object.entries(documents).map(([path, content]) => ({
				content,
				path
			}))
		};
		const timeoutId = window.setTimeout(() => {
			void (async () => {
				try {
					const response = await fetch(resolve('/demo/three/editor/preview'), {
						body: JSON.stringify(requestBody),
						headers: {
							'content-type': 'application/json'
						},
						method: 'POST'
					});

					if (!response.ok) {
						throw new Error('Preview request failed.');
					}

					if (requestId !== previewRequestId) {
						return;
					}

					preview = (await response.json()) as ThreePreviewBuildResult;
				} catch (error) {
					if (requestId !== previewRequestId) {
						return;
					}

					preview = {
						entryPath: previewEntryPath,
						error: toViewerError(error),
						status: 'error'
					};
				}
			})();
		}, 250);

		return () => {
			window.clearTimeout(timeoutId);
		};
	});

	$effect(() => {
		if (activeDocument === undefined) {
			activeFileContext = null;
			return;
		}

		activeFileContext = {
			content: activeDocument,
			isDirty,
			path: selectedPath,
			savedContent: activeSavedDocument
		};
	});

	$effect(() => {
		selectedPath;
		changedLineRanges = [];
	});

	$effect(() => {
		if (!pendingAppliedEdit || pendingAppliedEditToken === lastAppliedEditToken) {
			return;
		}

		lastAppliedEditToken = pendingAppliedEditToken;

		if (pendingAppliedEdit.path !== selectedPath) {
			return;
		}

		documents = {
			...documents,
			[pendingAppliedEdit.path]: pendingAppliedEdit.content
		};
		changedLineRanges = pendingAppliedEdit.changedLineRanges;
		void autoSaveAppliedEdit(pendingAppliedEdit);
	});

	function handleEditorChange(value: string): void {
		documents = {
			...documents,
			[selectedPath]: value
		};
		changedLineRanges = [];
		saveState = 'idle';
		saveError = null;
	}

	async function saveActiveDocument(): Promise<void> {
		saveState = 'saving';
		saveError = null;

		try {
			const nextDocument = documents[selectedPath];

			if (nextDocument === undefined) {
				return;
			}

			const savedDocument = await persistDocument({
				content: nextDocument,
				path: selectedPath
			});
			savedDocuments = {
				...savedDocuments,
				[savedDocument.path]: savedDocument.content
			};
			saveState = 'saved';
		} catch (error) {
			saveState = 'idle';
			saveError = error instanceof Error ? error.message : 'Save failed.';
		}
	}

	function handlePreviewErrorChange(error: ViewerError | null): void {
		previewSurfaceError = error;
	}

	async function autoSaveAppliedEdit(appliedEdit: PiEditorAgentAppliedEdit): Promise<void> {
		saveState = 'saving';
		saveError = null;

		try {
			const savedDocument = await persistDocument({
				content: appliedEdit.content,
				path: appliedEdit.path
			});

			savedDocuments = {
				...savedDocuments,
				[savedDocument.path]: savedDocument.content
			};
			saveState = 'saved';
		} catch (error) {
			saveState = 'idle';
			saveError = error instanceof Error ? error.message : 'Save failed.';
		}
	}

	async function persistDocument(document: ThreeSourceDocument): Promise<ThreeSourceDocument> {
		const response = await fetch(resolve('/demo/three/editor/file'), {
			body: JSON.stringify(document),
			headers: {
				'content-type': 'application/json'
			},
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error('Save request failed.');
		}

		return (await response.json()) as ThreeSourceDocument;
	}
</script>

<FileSelect {files} bind:value={selectedPath} label="Static Three file" />

{#if saveError}
	<p>{saveError}</p>
{:else if saveState === 'saved'}
	<p>Saved.</p>
{/if}

<div class="workspace-grid">
	<div class="workspace-column">
		{#if activeDocument === undefined}
			<p>Loading file...</p>
		{:else}
			{#key selectedPath}
				<CodeEditor
					changedLineRanges={changedLineRanges}
					diagnostic={activeDiagnostic}
					value={activeDocument}
					onChange={handleEditorChange}
					onSave={saveActiveDocument}
					saveDisabled={!isDirty || saveState === 'saving'}
				/>
			{/key}
		{/if}
	</div>

	<div class="workspace-column">
		<ThreePreview {preview} onErrorChange={handlePreviewErrorChange} />
	</div>
</div>

<style>
	.workspace-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr 1fr;
	}

	.workspace-column {
		min-width: 0;
	}

	@media (max-width: 960px) {
		.workspace-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
