import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
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

	it('keeps shared Three.js runtime imports external', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(
			join(rootDir, 'cube.ts'),
			`import { Scene } from 'three';

export const createDemoScene = () => {
\tnew Scene();

\treturn {
\t\tupdate() {},
\t\tdispose() {}
\t};
};`,
			'utf-8'
		);
		const builder = createThreePreviewBuilder(rootDir);

		const result = await builder.buildPreview({
			entryPath: 'cube.ts',
			files: []
		});

		expect(result.status).toBe('success');

		if (result.status === 'success') {
			expect(result.code).toContain('/editor/runtime/three/three.module.js');
			expect(result.code).not.toContain('Multiple instances of Three.js being imported');
			expect(result.code).not.toContain('window.__THREE__');
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

	it('resolves $lib template helper imports in preview code', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(
			join(rootDir, 'cube.ts'),
			`import {
	type ThreeDemoSceneFactory,
	defineThreeTemplateParameters
} from '$lib/features/editor/three-helpers';

export const templateParameters = defineThreeTemplateParameters({
	"spinSpeed": 0.01
});

export const createDemoScene: ThreeDemoSceneFactory = () => ({
	update() {},
	dispose() {}
});`,
			'utf-8'
		);
		const builder = createThreePreviewBuilder(rootDir);

		const result = await builder.buildPreview({
			entryPath: 'cube.ts',
			files: []
		});

		expect(result.status).toBe('success');
	});

	it('bundles every managed template source', async () => {
		const rootDir = await createFixtureDir();
		await mkdir(join(rootDir, 'scenes'), { recursive: true });
		const templateDir = resolve(process.cwd(), 'static', 'templates');
		const templateNames = (await readdir(templateDir)).filter((fileName) =>
			fileName.endsWith('.ts')
		);

		for (const templateName of templateNames) {
			const source = await readFile(join(templateDir, templateName), 'utf-8');
			await writeFile(join(rootDir, 'scenes', templateName), source, 'utf-8');
		}

		const builder = createThreePreviewBuilder(rootDir);

		for (const templateName of templateNames) {
			const result = await builder.buildPreview({
				entryPath: `scenes/${templateName}`,
				files: []
			});

			expect(result.status).toBe('success');
		}
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'three-editor-preview-'));
	temporaryDirs.push(dir);
	return dir;
}
