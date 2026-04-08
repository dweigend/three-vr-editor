/**
 * Purpose: Load the initial state for the Three editor demo page.
 * Context: The page edits managed source files under `static/three` and needs one initial preview result.
 * Responsibility: Return file summaries, the initial document, and the first bundled preview payload.
 * Boundaries: Ongoing file reads, saves, and preview rebuilds live in dedicated endpoint routes.
 */

import { error } from '@sveltejs/kit';

import { createThreeFileService } from '$lib/server/three/files';
import { createThreePreviewBuilder } from '$lib/server/three/preview-build';

import type { PageServerLoad } from './$types';

const PREVIEW_ENTRY_PATH = 'cube.ts';
const threeFileService = createThreeFileService();
const threePreviewBuilder = createThreePreviewBuilder();

export const load: PageServerLoad = async () => {
	const files = await threeFileService.listFiles();
	const selectedPath = files.find((file) => file.path === PREVIEW_ENTRY_PATH)?.path ?? files[0]?.path;

	if (!selectedPath) {
		throw error(404, 'No files found in static/three.');
	}

	const document = await threeFileService.readManagedFile(selectedPath);
	const preview = await threePreviewBuilder.buildPreview({
		entryPath: PREVIEW_ENTRY_PATH,
		files: [document]
	});

	return {
		document,
		files,
		preview,
		previewEntryPath: PREVIEW_ENTRY_PATH
	};
};
