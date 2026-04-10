import { error, json } from '@sveltejs/kit';

import { createThreePreviewBuilder } from '$lib/server/editor/preview-build';

import type { ThreePreviewBuildRequest } from '$lib/features/editor/three-editor-types';
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
