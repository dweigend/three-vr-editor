/**
 * Purpose: Centralize the initial data loading for Three editor-style demo routes.
 * Context: Multiple pages need the same managed file list, selected document, and preview bootstrap payload.
 * Responsibility: Load the first editable document and build the initial preview from `static/three`.
 * Boundaries: Incremental file reads, saves, and preview rebuild requests stay in the dedicated editor endpoints.
 */

import { error } from '@sveltejs/kit';

import {
	createThreeFileService,
	DEFAULT_MANAGED_SCENE_NAME,
	DEFAULT_PREVIEW_ENTRY_PATH
} from '$lib/server/three/files';
import { createThreePreviewBuilder } from '$lib/server/three/preview-build';
import type {
	ThreePreviewBuildResult,
	ThreeSourceDocument,
	ThreeSourceFileSummary
} from '$lib/three/three-editor-types';

export type ThreeEditorPageData = {
	document: ThreeSourceDocument;
	files: ThreeSourceFileSummary[];
	preview: ThreePreviewBuildResult;
	previewEntryPath: string;
};

export async function loadThreeEditorPageData(options?: {
	previewEntryPath?: string;
	rootDir?: string;
}): Promise<ThreeEditorPageData> {
	const previewEntryPath = options?.previewEntryPath ?? DEFAULT_PREVIEW_ENTRY_PATH;
	const threeFileService = createThreeFileService(options?.rootDir, previewEntryPath);
	const threePreviewBuilder = createThreePreviewBuilder(options?.rootDir);
	let files = await threeFileService.listFiles();

	if (files.length === 0) {
		await threeFileService.createManagedFile({
			fileName: DEFAULT_MANAGED_SCENE_NAME,
			mode: 'blank'
		});
		files = await threeFileService.listFiles();
	}

	const selectedPath = files.find((file) => file.path === previewEntryPath)?.path ?? files[0]?.path;

	if (!selectedPath) {
		throw error(404, 'No files found in static/three.');
	}

	const document = await threeFileService.readManagedFile(selectedPath);
	const activePreviewEntryPath = files.some((file) => file.path === previewEntryPath)
		? previewEntryPath
		: selectedPath;
	const preview = await threePreviewBuilder.buildPreview({
		entryPath: activePreviewEntryPath,
		files: [document]
	});

	return {
		document,
		files,
		preview,
		previewEntryPath: activePreviewEntryPath
	};
}
