import { error } from '@sveltejs/kit';

import {
	createThreeFileService,
	DEFAULT_MANAGED_SCENE_NAME,
	DEFAULT_PREVIEW_ENTRY_PATH
} from '$lib/server/editor/files';
import { createThreePreviewBuilder } from '$lib/server/editor/preview-build';
import type {
	ThreePreviewBuildResult,
	ThreeSourceDocument,
	ThreeSourceFileSummary
} from '$lib/features/editor/three-editor-types';
import type { ThreeTemplateSummary } from '$lib/features/editor/three-template-types';

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
