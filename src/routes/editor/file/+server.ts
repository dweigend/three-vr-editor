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
