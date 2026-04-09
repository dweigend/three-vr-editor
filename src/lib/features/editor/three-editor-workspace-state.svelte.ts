/**
 * Purpose: Centralize the client-side state orchestration shared by the editor workspace.
 * Context: The editor page needs one reusable place for managed file loading, preview rebuilds, save handling, and active-file context.
 * Responsibility: Keep document records, selected-file state, preview requests, and save actions reusable across workspace variants.
 * Boundaries: This module does not render UI controls or know about route-specific headings, Pi panels, or template-specific sidebars.
 */

import type { EditorDiagnostic, EditorLineRange } from '$lib/features/editor/editor-diagnostics';
import type { ThreeEditorActiveFileContext } from '$lib/features/editor/three-editor-workspace-types';
import type {
	ThreePreviewBuildResult,
	ThreeSourceDocument,
	ThreeSourceFileSummary
} from '$lib/features/editor/three-editor-types';
import type { ViewerError } from '$lib/features/editor/three-viewer-errors';
import type { ThreeCreateFileRequest, ThreeCreateFileResult } from '$lib/features/editor/three-template-types';

import { toViewerError } from '$lib/features/editor/three-viewer-errors';

type ThreeEditorWorkspacePreviewMode = 'fixed' | 'selected';

type CreateThreeEditorWorkspaceStateOptions = {
	createFileEndpoint: string;
	fileEndpoint: string;
	files: ThreeSourceFileSummary[];
	initialDocument: ThreeSourceDocument;
	initialPreview: ThreePreviewBuildResult;
	previewEndpoint: string;
	previewEntryPath: string;
	previewMode?: ThreeEditorWorkspacePreviewMode;
};

export function createThreeEditorWorkspaceState(options: CreateThreeEditorWorkspaceStateOptions) {
	let files = $state(options.files);
	let documents = $state<Record<string, string>>({
		[options.initialDocument.path]: options.initialDocument.content
	});
	let preview = $state<ThreePreviewBuildResult | null>(options.initialPreview);
	let previewSurfaceError = $state<ViewerError | null>(
		options.initialPreview.status === 'error' ? options.initialPreview.error : null
	);
	let saveError = $state<string | null>(null);
	let saveState = $state<'idle' | 'saved' | 'saving'>('idle');
	let savedDocuments = $state<Record<string, string>>({
		[options.initialDocument.path]: options.initialDocument.content
	});
	let selectedPath = $state(options.initialDocument.path);
	let changedLineRanges = $state<EditorLineRange[]>([]);
	let previewRequestId = 0;

	const activeDocument = $derived(documents[selectedPath]);
	const activeSavedDocument = $derived(savedDocuments[selectedPath] ?? '');
	const activePreviewEntryPath = $derived(
		options.previewMode === 'selected' ? selectedPath : options.previewEntryPath
	);
	const isDirty = $derived((documents[selectedPath] ?? '') !== (savedDocuments[selectedPath] ?? ''));
	const activeFileContext = $derived.by<ThreeEditorActiveFileContext | null>(() => {
		if (activeDocument === undefined) {
			return null;
		}

		return {
			content: activeDocument,
			isDirty,
			path: selectedPath,
			savedContent: activeSavedDocument
		};
	});
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
			const response = await fetch(`${options.fileEndpoint}?path=${encodeURIComponent(filePath)}`);

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
			entryPath: activePreviewEntryPath,
			files: Object.entries(documents).map(([path, content]) => ({
				content,
				path
			}))
		};
		const timeoutId = window.setTimeout(() => {
			void (async () => {
				try {
					const response = await fetch(options.previewEndpoint, {
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
						entryPath: activePreviewEntryPath,
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
		selectedPath;
		changedLineRanges = [];
	});

	return {
		get activeDiagnostic() {
			return activeDiagnostic;
		},
		get activeDocument() {
			return activeDocument;
		},
		get activeFileContext() {
			return activeFileContext;
		},
		get changedLineRanges() {
			return changedLineRanges;
		},
		get files() {
			return files;
		},
		get isDirty() {
			return isDirty;
		},
		get preview() {
			return preview;
		},
		get saveError() {
			return saveError;
		},
		get saveState() {
			return saveState;
		},
		get selectedPath() {
			return selectedPath;
		},
		set selectedPath(value: string) {
			selectedPath = value;
		},
		applyDocumentUpdate(value: string, nextChangedLineRanges: EditorLineRange[] = []) {
			documents = {
				...documents,
				[selectedPath]: value
			};
			changedLineRanges = nextChangedLineRanges;
			saveError = null;
			saveState = 'idle';
		},
		async createFile(request: ThreeCreateFileRequest): Promise<void> {
			const response = await fetch(options.createFileEndpoint, {
				body: JSON.stringify(request),
				headers: {
					'content-type': 'application/json'
				},
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error(await readRequestError(response, 'Create file request failed.'));
			}

			const createdFile = (await response.json()) as ThreeCreateFileResult;
			const nextFileSummary: ThreeSourceFileSummary = {
				extension: '.ts',
				isPreviewEntry: false,
				isPreviewRelevant: true,
				name: createdFile.path.split('/').at(-1) ?? createdFile.path,
				path: createdFile.path
			};

			files = sortThreeSourceFiles([...files, nextFileSummary]);
			documents = {
				...documents,
				[createdFile.path]: createdFile.content
			};
			savedDocuments = {
				...savedDocuments,
				[createdFile.path]: createdFile.content
			};
			selectedPath = createdFile.path;
			saveError = null;
			saveState = 'saved';
		},
		handlePreviewErrorChange(error: ViewerError | null): void {
			previewSurfaceError = error;
		},
		handleSourceChange(value: string): void {
			documents = {
				...documents,
				[selectedPath]: value
			};
			changedLineRanges = [];
			saveError = null;
			saveState = 'idle';
		},
		async saveActiveDocument(): Promise<void> {
			const nextDocument = documents[selectedPath];

			if (nextDocument === undefined) {
				return;
			}

			saveState = 'saving';
			saveError = null;

			try {
				const savedDocument = await persistDocument(options.fileEndpoint, {
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
	};
}

async function readRequestError(response: Response, fallbackMessage: string): Promise<string> {
	const errorText = await response.text();
	const normalizedErrorText = errorText.trim();

	if (normalizedErrorText.length === 0) {
		return fallbackMessage;
	}

	try {
		const parsedError = JSON.parse(normalizedErrorText) as {
			message?: string;
		};

		if (typeof parsedError.message === 'string' && parsedError.message.trim().length > 0) {
			return parsedError.message;
		}
	} catch {
		return normalizedErrorText;
	}

	return fallbackMessage;
}

async function persistDocument(
	fileEndpoint: string,
	document: ThreeSourceDocument
): Promise<ThreeSourceDocument> {
	const response = await fetch(fileEndpoint, {
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

function sortThreeSourceFiles(files: ThreeSourceFileSummary[]): ThreeSourceFileSummary[] {
	return [...files].sort((left, right) => left.path.localeCompare(right.path));
}
