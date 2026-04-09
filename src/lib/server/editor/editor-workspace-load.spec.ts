/**
 * Purpose: Verify that the editor workspace loader returns the complete bootstrap payload for the editor page.
 * Context: The single editor route depends on one loader that combines editable files, initial preview data, and template metadata.
 * Responsibility: Cover managed file loading, local bootstrap creation, preview output, and parsed template summaries.
 * Boundaries: These tests do not exercise the browser workspace UI or the create/save endpoints.
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, describe, expect, it } from 'vitest';

import { loadEditorWorkspacePageData } from './editor-workspace-load';

const temporaryDirs: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
});

describe('loadEditorWorkspacePageData', () => {
	it('loads the initial managed document, preview payload, and templates', async () => {
		const rootDir = await createFixtureDir();
		const templateRootDir = await createFixtureDir();
		await mkdir(join(rootDir, 'scenes'));
		await writeFile(
			join(rootDir, 'scenes', 'cube.ts'),
			'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			'utf-8'
		);
		await writeFile(join(rootDir, 'helper.ts'), 'export const helper = true;', 'utf-8');
		await writeFile(
			join(templateRootDir, 'template.ts'),
			`/* @three-template
{
\t"id": "template",
\t"title": "Template",
\t"description": "Template description",
\t"rendererKind": "webgl",
\t"tags": ["template"],
\t"parameters": []
}
*/
export const createDemoScene = () => ({ update() {}, dispose() {} });`,
			'utf-8'
		);

		const result = await loadEditorWorkspacePageData({ rootDir, templateRootDir });

		expect(result.document.path).toBe('scenes/cube.ts');
		expect(result.files.map((file) => file.path)).toEqual(['helper.ts', 'scenes/cube.ts']);
		expect(result.previewEntryPath).toBe('scenes/cube.ts');
		expect(result.preview.status).toBe('success');
		expect(result.templates).toEqual([
			expect.objectContaining({
				id: 'template',
				path: 'template.ts',
				title: 'Template'
			})
		]);
	});

	it('creates a local bootstrap scene when the managed workspace is empty', async () => {
		const rootDir = await createFixtureDir();
		const templateRootDir = await createFixtureDir();

		const result = await loadEditorWorkspacePageData({ rootDir, templateRootDir });

		expect(result.document.path).toBe('scenes/cube.ts');
		expect(result.files.map((file) => file.path)).toEqual(['scenes/cube.ts']);
		expect(result.previewEntryPath).toBe('scenes/cube.ts');
		expect(result.preview.status).toBe('success');
		expect(result.templates).toEqual([]);
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'editor-workspace-load-'));
	temporaryDirs.push(dir);
	return dir;
}
