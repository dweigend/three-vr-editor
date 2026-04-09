/**
 * Purpose: Expose managed file creation for the editor workspace.
 * Context: The editor route can create blank scene files or copy a managed template into `static/three/scenes`.
 * Responsibility: Validate the incoming create payload and delegate the actual write to the managed file service.
 * Boundaries: Reading, saving, and preview bundling stay in the dedicated sibling modules.
 */

import { error, json } from '@sveltejs/kit';

import type { ThreeCreateFileRequest } from '$lib/features/editor/three-template-types';
import { createThreeFileService } from '$lib/server/editor/files';

import type { RequestHandler } from './$types';

const threeFileService = createThreeFileService();

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Partial<ThreeCreateFileRequest>;
	const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
	const mode = body.mode;

	if (fileName.length === 0) {
		throw error(400, 'File name is required.');
	}

	if (mode === 'blank') {
		return json(
			await threeFileService.createManagedFile({
				fileName,
				mode
			})
		);
	}

	if (mode === 'template' && typeof body.templatePath === 'string') {
		return json(
			await threeFileService.createManagedFile({
				fileName,
				mode,
				templatePath: body.templatePath
			})
		);
	}

	throw error(400, 'Invalid create file request.');
};
