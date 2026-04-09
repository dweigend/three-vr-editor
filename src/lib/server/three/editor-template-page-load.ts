/**
 * Purpose: Load the additive Three template workbench bootstrap data for the new demo route.
 * Context: The template editor route extends the existing editor bootstrap with template listing and workbench-specific file creation.
 * Responsibility: Reuse the managed editor demo data and append the available template summaries.
 * Boundaries: Incremental save, create, and preview requests stay in dedicated endpoint routes.
 */

import { loadThreeEditorPageData, type ThreeEditorPageData } from './editor-page-load';
import { createThreeTemplateService } from './templates';

import type { ThreeTemplateSummary } from '$lib/three/three-template-types';

export type ThreeEditorTemplatePageData = ThreeEditorPageData & {
	templates: ThreeTemplateSummary[];
};

export async function loadThreeEditorTemplatePageData(options?: {
	rootDir?: string;
	templateRootDir?: string;
}): Promise<ThreeEditorTemplatePageData> {
	const [editorData, templates] = await Promise.all([
		loadThreeEditorPageData(options),
		createThreeTemplateService(options?.templateRootDir).listTemplates()
	]);

	return {
		...editorData,
		templates
	};
}
