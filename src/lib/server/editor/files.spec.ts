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
		await mkdir(join(rootDir, 'templates'));
		await mkdir(join(rootDir, 'shared'));
		await mkdir(join(rootDir, 'scenes'));
		await writeFile(join(rootDir, 'scenes', 'cube.ts'), 'export const createDemoScene = () => null;', 'utf-8');
		await writeFile(join(rootDir, 'nested', 'helper.ts'), 'export const helper = true;', 'utf-8');
		await writeFile(join(rootDir, 'templates', 'template.ts'), 'export const ignored = true;', 'utf-8');
		await writeFile(join(rootDir, 'shared', 'helper.ts'), 'export const ignored = true;', 'utf-8');
		const service = createThreeFileService(rootDir);

		await expect(service.listFiles()).resolves.toEqual([
			{
				extension: '.ts',
				isPreviewEntry: false,
				isPreviewRelevant: true,
				name: 'helper.ts',
				path: 'nested/helper.ts'
			},
			{
				extension: '.ts',
				isPreviewEntry: true,
				isPreviewRelevant: true,
				name: 'cube.ts',
				path: 'scenes/cube.ts'
			}
		]);
	});

	it('rejects paths outside the managed root', async () => {
		const rootDir = await createFixtureDir();
		await mkdir(join(rootDir, 'scenes'));
		await writeFile(join(rootDir, 'scenes', 'cube.ts'), 'export const createDemoScene = () => null;', 'utf-8');
		const service = createThreeFileService(rootDir);

		await expect(service.readManagedFile('../secret.ts')).rejects.toThrow(
			'File path is outside the managed static/three directory.'
		);
	});

	it('saves a valid managed file', async () => {
		const rootDir = await createFixtureDir();
		await mkdir(join(rootDir, 'scenes'));
		const filePath = join(rootDir, 'scenes', 'cube.ts');
		await writeFile(filePath, 'export const createDemoScene = () => null;', 'utf-8');
		const service = createThreeFileService(rootDir);

		await service.saveManagedFile({
			content: 'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			path: 'scenes/cube.ts'
		});

		await expect(readFile(filePath, 'utf-8')).resolves.toContain('update() {}');
	});

	it('creates a blank scene file under scenes', async () => {
		const rootDir = await createFixtureDir();
		const service = createThreeFileService(rootDir);

		const createdFile = await service.createManagedFile({
			fileName: 'My New Scene',
			mode: 'blank'
		});

		expect(createdFile.path).toBe('scenes/my-new-scene.ts');
		await expect(readFile(join(rootDir, createdFile.path), 'utf-8')).resolves.toContain(
			'export const createDemoScene'
		);
		await expect(readFile(join(rootDir, createdFile.path), 'utf-8')).resolves.toContain(
			"$lib/features/editor/three-helpers"
		);
	});

	it('creates a scene file from a managed template', async () => {
		const rootDir = await createFixtureDir();
		const templateDir = await createFixtureDir();
		await writeFile(
			join(templateDir, 'template.ts'),
			'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			'utf-8'
		);
		const service = createThreeFileService(rootDir, 'scenes/cube.ts', {
			templateRootDir: templateDir
		});

		const createdFile = await service.createManagedFile({
			fileName: 'Template Clone',
			mode: 'template',
			templatePath: 'template.ts'
		});

		expect(createdFile.path).toBe('scenes/template-clone.ts');
		await expect(readFile(join(rootDir, createdFile.path), 'utf-8')).resolves.toContain(
			'createDemoScene'
		);
	});

	it('rejects template copies outside the managed templates directory', async () => {
		const rootDir = await createFixtureDir();
		await mkdir(join(rootDir, 'scenes'));
		await writeFile(join(rootDir, 'scenes', 'cube.ts'), 'export const createDemoScene = () => null;', 'utf-8');
		const service = createThreeFileService(rootDir);

		await expect(
			service.createManagedFile({
				fileName: 'Bad Template Clone',
				mode: 'template',
				templatePath: '../cube.ts'
			})
		).rejects.toThrow('File path is outside the managed static/three directory.');
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'three-editor-files-'));
	temporaryDirs.push(dir);
	return dir;
}
