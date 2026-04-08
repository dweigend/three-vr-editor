/**
 * Purpose: Build the live Three preview payload from the current in-memory editor state.
 * Context: The editor page posts its local source map here whenever preview-relevant code changes.
 * Responsibility: Return bundled browser code or a normalized preview error payload.
 * Boundaries: This route does not persist files or render any client UI.
 */

import { error, json } from '@sveltejs/kit';

import { createThreePreviewBuilder } from '$lib/server/three/preview-build';

import type { ThreePreviewBuildRequest } from '$lib/three/three-editor-types';
import type { RequestHandler } from './$types';

const threePreviewBuilder = createThreePreviewBuilder();

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Partial<ThreePreviewBuildRequest>;

	if (typeof body.entryPath !== 'string' || !Array.isArray(body.files)) {
		throw error(400, 'Invalid preview build request.');
	}

	const preview = await threePreviewBuilder.buildPreview({
		entryPath: body.entryPath,
		files: body.files
			.filter(
				(file): file is { content: string; path: string } =>
					typeof file?.content === 'string' && typeof file?.path === 'string'
			)
			.map((file) => ({
				content: file.content,
				path: file.path
			}))
	});

	return json(preview);
};
