import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
	readThreeTemplateHeader
} from '$lib/features/editor/three-template-source';
import type { ThreeTemplateSummary } from '$lib/features/editor/three-template-types';

import { listManagedFiles, resolveManagedFilePath } from './files';
import { STATIC_TEMPLATES_DIR } from './paths';

export type ThreeTemplateService = {
	listTemplates: () => Promise<ThreeTemplateSummary[]>;
};

export function createThreeTemplateService(rootDir: string = STATIC_TEMPLATES_DIR): ThreeTemplateService {
	const normalizedRootDir = resolve(rootDir);

	return {
		listTemplates: async () => {
			const templatePaths = await listManagedFiles(normalizedRootDir, normalizedRootDir);
			const templates: ThreeTemplateSummary[] = [];

			for (const templatePath of templatePaths) {
				const source = await readFile(resolveManagedFilePath(normalizedRootDir, templatePath), 'utf-8');
				const header = readThreeTemplateHeader(source);

				if (!header) {
					continue;
				}

				templates.push({
					description: header.description,
					id: header.id,
					parameters: header.parameters,
					path: templatePath,
					rendererKind: header.rendererKind,
					tags: header.tags,
					title: header.title
				});
			}

			return templates.sort((left, right) => left.title.localeCompare(right.title));
		}
	};
}
