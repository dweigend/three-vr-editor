/**
 * Purpose: Verify that the shared Three editor demo loader returns the same bootstrap state expected by both demo routes.
 * Context: The plain editor page and the Pi-enhanced editor page should stay aligned on initial file and preview data.
 * Responsibility: Cover managed file loading and the initial preview build result from a temporary fixture root.
 * Boundaries: These tests do not exercise the browser editor workspace or save endpoints.
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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
		await mkdir(join(rootDir, 'scenes'));
		await writeFile(
			join(rootDir, 'scenes', 'cube.ts'),
			'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			'utf-8'
		);
		await writeFile(join(rootDir, 'helper.ts'), 'export const helper = true;', 'utf-8');

		const result = await loadThreeEditorPageData({ rootDir });

		expect(result.document.path).toBe('scenes/cube.ts');
		expect(result.files.map((file) => file.path)).toEqual(['helper.ts', 'scenes/cube.ts']);
		expect(result.previewEntryPath).toBe('scenes/cube.ts');
		expect(result.preview.status).toBe('success');
	});

	it('creates a local bootstrap scene when the managed workspace is empty', async () => {
		const rootDir = await createFixtureDir();

		const result = await loadThreeEditorPageData({ rootDir });

		expect(result.document.path).toBe('scenes/cube.ts');
		expect(result.files.map((file) => file.path)).toEqual(['scenes/cube.ts']);
		expect(result.previewEntryPath).toBe('scenes/cube.ts');
		expect(result.preview.status).toBe('success');
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'three-editor-demo-load-'));
	temporaryDirs.push(dir);
	return dir;
}
