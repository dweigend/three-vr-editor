/**
 * Serves the shared Three.js browser modules used by the editor runtime and
 * preview bundles. The route is intentionally limited to the small whitelist
 * required by the editor so we avoid shipping duplicate Three.js instances.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { error } from '@sveltejs/kit';

import { THREE_RUNTIME_FILE_NAMES } from '$lib/features/editor/three-runtime-module-urls';

import type { RequestHandler } from './$types';

const ALLOWED_THREE_RUNTIME_FILES = new Set<string>(THREE_RUNTIME_FILE_NAMES);
const THREE_BUILD_DIR = resolve(process.cwd(), 'node_modules', 'three', 'build');

export const GET: RequestHandler = async ({ params }) => {
	const fileName = params.file;

	if (!ALLOWED_THREE_RUNTIME_FILES.has(fileName)) {
		throw error(404, 'Unknown Three.js runtime module.');
	}

	const contents = await readFile(resolve(THREE_BUILD_DIR, fileName), 'utf-8');

	return new Response(contents, {
		headers: {
			'cache-control': 'public, max-age=3600',
			'content-type': 'text/javascript; charset=utf-8'
		}
	});
};
