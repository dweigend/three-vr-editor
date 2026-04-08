<!--
	Purpose: Compose the file picker, editor, and live Three preview for the editable demo workflow.
	Context: This page demonstrates how reusable editor and preview modules work together around `static/three`.
	Responsibility: Orchestrate file selection, local edit state, save actions, and preview rebuild requests.
	Boundaries: File access, preview bundling, and Three runtime details stay in library or endpoint modules.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	import CodeEditor from '$lib/editor/CodeEditor.svelte';
	import type { EditorDiagnostic } from '$lib/editor/editor-diagnostics';
	import FileSelect from '$lib/editor/FileSelect.svelte';
	import ThreePreview from '$lib/three/ThreePreview.svelte';
	import type { ViewerError } from '$lib/three/three-viewer-errors';
	import type { ThreePreviewBuildResult, ThreeSourceDocument } from '$lib/three/three-editor-types';
	import { toViewerError } from '$lib/three/three-viewer-errors';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const files = untrack(() => data.files);
	const initialDocument = untrack(() => data.document);
	const initialPreview = untrack(() => data.preview);
	const previewEntryPath = untrack(() => data.previewEntryPath);

	let documents = $state<Record<string, string>>({
		[initialDocument.path]: initialDocument.content
	});
	let preview = $state<ThreePreviewBuildResult | null>(initialPreview);
	let previewSurfaceError = $state<ViewerError | null>(
		initialPreview.status === 'error' ? initialPreview.error : null
	);
	let saveError = $state<string | null>(null);
	let saveState = $state<'idle' | 'saving' | 'saved'>('idle');
	let savedDocuments = $state<Record<string, string>>({
		[initialDocument.path]: initialDocument.content
	});
	let selectedPath = $state(initialDocument.path);
	let previewRequestId = 0;

	const activeDocument = $derived(documents[selectedPath]);
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
			const response = await fetch(`${resolve('/demo/three/editor/file')}?path=${encodeURIComponent(filePath)}`);

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

	function handleEditorChange(value: string): void {
		documents = {
			...documents,
			[selectedPath]: value
		};
		saveState = 'idle';
		saveError = null;
	}

	async function saveActiveDocument(): Promise<void> {
		const nextDocument = documents[selectedPath];

		if (nextDocument === undefined) {
			return;
		}

		saveState = 'saving';
		saveError = null;

		try {
			const response = await fetch(resolve('/demo/three/editor/file'), {
				body: JSON.stringify({
					content: nextDocument,
					path: selectedPath
				} satisfies ThreeSourceDocument),
				headers: {
					'content-type': 'application/json'
				},
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Save request failed.');
			}

			const savedDocument = (await response.json()) as ThreeSourceDocument;

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
</script>

<svelte:head>
	<title>Three.js Editor Demo</title>
</svelte:head>

<h1>Three.js editor demo</h1>
<p><a href={resolve('/')}>Back to start</a></p>
<p><a href={resolve('/demo')}>Back to demos</a></p>
<p><a href={resolve('/demo/three')}>Open viewer demo</a></p>

<FileSelect {files} bind:value={selectedPath} label="Static Three file" />

{#if saveError}
	<p>{saveError}</p>
{:else if saveState === 'saved'}
	<p>Saved.</p>
{/if}

<div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
	<div style="min-width: 0;">
		{#if activeDocument === undefined}
			<p>Loading file...</p>
		{:else}
			{#key selectedPath}
				<CodeEditor
					diagnostic={activeDiagnostic}
					value={activeDocument}
					onChange={handleEditorChange}
					onSave={saveActiveDocument}
					saveDisabled={!isDirty || saveState === 'saving'}
				/>
			{/key}
		{/if}
	</div>

	<div style="min-width: 0;">
		<ThreePreview {preview} onErrorChange={handlePreviewErrorChange} />
	</div>
</div>
