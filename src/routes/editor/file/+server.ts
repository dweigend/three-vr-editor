/**
 * Purpose: Expose managed file reads and saves for the editable `static/three` source files.
 * Context: The editor page loads documents on selection and persists them through this endpoint.
 * Responsibility: Return one file document on GET and save one file document on POST.
 * Boundaries: Preview bundling is handled by the dedicated preview endpoint.
 */

import { error, json } from '@sveltejs/kit';

import { createThreeFileService } from '$lib/server/editor/files';

import type { RequestHandler } from './$types';

const threeFileService = createThreeFileService();

type SaveRequestBody = {
	content?: unknown;
	path?: unknown;
};

export const GET: RequestHandler = async ({ url }) => {
	const filePath = url.searchParams.get('path')?.trim() ?? '';

	if (filePath.length === 0) {
		throw error(400, 'File path is required.');
	}

	const document = await threeFileService.readManagedFile(filePath);
	return json(document);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as SaveRequestBody;
	const filePath = typeof body.path === 'string' ? body.path.trim() : '';
	const content = typeof body.content === 'string' ? body.content : '';

	if (filePath.length === 0) {
		throw error(400, 'File path is required.');
	}

	const document = await threeFileService.saveManagedFile({
		content,
		path: filePath
	});

	return json(document);
};
