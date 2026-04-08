/**
 * Purpose: Verify that the managed static/three file service only exposes and writes allowed files.
 * Context: The Three editor route depends on this service for listing, loading, and saving editable demo files.
 * Responsibility: Cover recursive listing, path guarding, and valid save behavior.
 * Boundaries: These tests do not build previews or mount any client-side editor components.
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';

import { createThreeFileService } from './files';

const temporaryDirs: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
});

describe('createThreeFileService', () => {
	it('lists managed files recursively and excludes hidden placeholders', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(join(rootDir, '.gitkeep'), '', 'utf-8');
		await mkdir(join(rootDir, 'nested'));
		await writeFile(join(rootDir, 'cube.ts'), 'export const createDemoScene = () => null;', 'utf-8');
		await writeFile(join(rootDir, 'nested', 'helper.ts'), 'export const helper = true;', 'utf-8');
		const service = createThreeFileService(rootDir);

		await expect(service.listFiles()).resolves.toEqual([
			{
				extension: '.ts',
				isPreviewEntry: true,
				isPreviewRelevant: true,
				name: 'cube.ts',
				path: 'cube.ts'
			},
			{
				extension: '.ts',
				isPreviewEntry: false,
				isPreviewRelevant: true,
				name: 'helper.ts',
				path: 'nested/helper.ts'
			}
		]);
	});

	it('rejects paths outside the managed root', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(join(rootDir, 'cube.ts'), 'export const createDemoScene = () => null;', 'utf-8');
		const service = createThreeFileService(rootDir);

		await expect(service.readManagedFile('../secret.ts')).rejects.toThrow(
			'File path is outside the managed static/three directory.'
		);
	});

	it('saves a valid managed file', async () => {
		const rootDir = await createFixtureDir();
		const filePath = join(rootDir, 'cube.ts');
		await writeFile(filePath, 'export const createDemoScene = () => null;', 'utf-8');
		const service = createThreeFileService(rootDir);

		await service.saveManagedFile({
			content: 'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			path: 'cube.ts'
		});

		await expect(readFile(filePath, 'utf-8')).resolves.toContain('update() {}');
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'three-editor-files-'));
	temporaryDirs.push(dir);
	return dir;
}
