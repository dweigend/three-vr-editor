/**
 * Purpose: Verify that the shared Three editor demo loader returns the same bootstrap state expected by both demo routes.
 * Context: The plain editor page and the Pi-enhanced editor page should stay aligned on initial file and preview data.
 * Responsibility: Cover managed file loading and the initial preview build result from a temporary fixture root.
 * Boundaries: These tests do not exercise the browser editor workspace or save endpoints.
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';

import { loadThreeEditorPageData } from './editor-page-load';

const temporaryDirs: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
});

describe('loadThreeEditorPageData', () => {
	it('loads the initial managed document and preview payload', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(
			join(rootDir, 'cube.ts'),
			'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			'utf-8'
		);
		await writeFile(join(rootDir, 'helper.ts'), 'export const helper = true;', 'utf-8');

		const result = await loadThreeEditorPageData({ rootDir });

		expect(result.document.path).toBe('cube.ts');
		expect(result.files.map((file) => file.path)).toEqual(['cube.ts', 'helper.ts']);
		expect(result.previewEntryPath).toBe('cube.ts');
		expect(result.preview.status).toBe('success');
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'three-editor-demo-load-'));
	temporaryDirs.push(dir);
	return dir;
}
