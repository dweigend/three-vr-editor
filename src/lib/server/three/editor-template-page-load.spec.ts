/**
 * Purpose: Verify that the additive template workbench loader returns both editor bootstrap data and managed templates.
 * Context: The new demo route depends on one loader that combines editable files, initial preview data, and template metadata.
 * Responsibility: Cover the managed file list, preview payload, and template summaries from a fixture root.
 * Boundaries: These tests do not exercise the browser workspace UI or the create/save endpoints.
 */

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';

import { loadThreeEditorTemplatePageData } from './editor-template-page-load';

const temporaryDirs: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
});

describe('loadThreeEditorTemplatePageData', () => {
	it('returns managed files plus parsed template summaries', async () => {
		const rootDir = await createFixtureDir();
		await writeFile(
			join(rootDir, 'cube.ts'),
			'export const createDemoScene = () => ({ update() {}, dispose() {} });',
			'utf-8'
		);
		await mkdir(join(rootDir, 'templates'));
		await writeFile(
			join(rootDir, 'templates', 'template.ts'),
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

		const result = await loadThreeEditorTemplatePageData({ rootDir });

		expect(result.document.path).toBe('cube.ts');
		expect(result.files.map((file) => file.path)).toEqual(['cube.ts']);
		expect(result.templates).toEqual([
			expect.objectContaining({
				id: 'template',
				path: 'templates/template.ts',
				title: 'Template'
			})
		]);
		expect(result.preview.status).toBe('success');
	});
});

async function createFixtureDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'three-editor-template-demo-load-'));
	temporaryDirs.push(dir);
	return dir;
}
