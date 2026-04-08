/**
 * Purpose: Centralize the initial data loading for Three editor-style demo routes.
 * Context: Multiple pages need the same managed file list, selected document, and preview bootstrap payload.
 * Responsibility: Load the first editable document and build the initial preview from `static/three`.
 * Boundaries: Incremental file reads, saves, and preview rebuild requests stay in the dedicated editor endpoints.
 */

import { error } from '@sveltejs/kit';

import { createThreeFileService } from '$lib/server/three/files';
import { createThreePreviewBuilder } from '$lib/server/three/preview-build';
import type {
	ThreePreviewBuildResult,
	ThreeSourceDocument,
	ThreeSourceFileSummary
} from '$lib/three/three-editor-types';

const DEFAULT_PREVIEW_ENTRY_PATH = 'cube.ts';

export type ThreeEditorDemoPageData = {
	document: ThreeSourceDocument;
	files: ThreeSourceFileSummary[];
	preview: ThreePreviewBuildResult;
	previewEntryPath: string;
};

export async function loadThreeEditorDemoData(options?: {
	previewEntryPath?: string;
	rootDir?: string;
}): Promise<ThreeEditorDemoPageData> {
	const previewEntryPath = options?.previewEntryPath ?? DEFAULT_PREVIEW_ENTRY_PATH;
	const threeFileService = createThreeFileService(options?.rootDir, previewEntryPath);
	const threePreviewBuilder = createThreePreviewBuilder(options?.rootDir);
	const files = await threeFileService.listFiles();
	const selectedPath = files.find((file) => file.path === previewEntryPath)?.path ?? files[0]?.path;

	if (!selectedPath) {
		throw error(404, 'No files found in static/three.');
	}

	const document = await threeFileService.readManagedFile(selectedPath);
	const preview = await threePreviewBuilder.buildPreview({
		entryPath: previewEntryPath,
		files: [document]
	});

	return {
		document,
		files,
		preview,
		previewEntryPath
	};
}
