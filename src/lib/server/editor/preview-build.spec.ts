/**
 * Purpose: Verify that the Three preview builder bundles valid scene code and normalizes invalid code errors.
 * Context: The editor page rebuilds the preview from in-memory `static/three` source overrides.
 * Responsibility: Cover both successful bundling and syntax-error handling.
 * Boundaries: These tests do not render the bundled code in a browser runtime.
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';

import { createThreePreviewBuilder } from './preview-build';

const temporaryDirs: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
});

describe('createThreePreviewBuilder', () => {
	it('bundles a valid preview entry', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(
			join(rootDir, 'cube.ts'),
			'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			'utf-8'
		);
		const builder = createThreePreviewBuilder(rootDir);

		const result = await builder.buildPreview({
			entryPath: 'cube.ts',
			files: []
		});

		expect(result.status).toBe('success');

		if (result.status === 'success') {
			expect(result.code).toContain('createDemoScene');
			expect(result.map).toContain('"sources":["cube.ts"]');
		}
	});

	it('returns a normalized build error for invalid code', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(
			join(rootDir, 'cube.ts'),
			'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			'utf-8'
		);
		const builder = createThreePreviewBuilder(rootDir);

		const result = await builder.buildPreview({
			entryPath: 'cube.ts',
			files: [
				{
					content: 'export const createDemoScene = () => {',
					path: 'cube.ts'
				}
			]
		});

		expect(result.status).toBe('error');

		if (result.status === 'error') {
			expect(result.error.title).toBe('Three.js preview build error');
			expect(result.error.message.length).toBeGreaterThan(0);
			expect(result.error.source?.filePath).toBe('cube.ts');
			expect(result.error.source?.line).toBeGreaterThan(0);
		}
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'three-editor-preview-'));
	temporaryDirs.push(dir);
	return dir;
}
