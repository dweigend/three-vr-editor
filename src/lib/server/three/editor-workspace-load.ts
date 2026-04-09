/**
 * Purpose: Load the full bootstrap state for the editor workspace page.
 * Context: The app now has one main editor route that needs managed files, initial preview data, and available templates together.
 * Responsibility: Ensure a managed scene exists, build the initial preview payload, and append parsed template summaries.
 * Boundaries: Incremental save, create, and preview requests stay in dedicated endpoint routes.
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
import type { ThreeTemplateSummary } from '$lib/three/three-template-types';

import { createThreeTemplateService } from './templates';

export type EditorWorkspacePageData = {
	document: ThreeSourceDocument;
	files: ThreeSourceFileSummary[];
	preview: ThreePreviewBuildResult;
	previewEntryPath: string;
	templates: ThreeTemplateSummary[];
};

export async function loadEditorWorkspacePageData(options?: {
	previewEntryPath?: string;
	rootDir?: string;
	templateRootDir?: string;
}): Promise<EditorWorkspacePageData> {
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

	const [document, templates] = await Promise.all([
		threeFileService.readManagedFile(selectedPath),
		createThreeTemplateService(options?.templateRootDir).listTemplates()
	]);
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
		previewEntryPath: activePreviewEntryPath,
		templates
	};
}
