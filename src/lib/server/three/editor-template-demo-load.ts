/**
 * Purpose: Load the additive Three template workbench bootstrap data for the new demo route.
 * Context: The template editor route extends the existing editor bootstrap with template listing and workbench-specific file creation.
 * Responsibility: Reuse the managed editor demo data and append the available template summaries.
 * Boundaries: Incremental save, create, and preview requests stay in dedicated endpoint routes.
 */

import { loadThreeEditorDemoData, type ThreeEditorDemoPageData } from './editor-demo-load';
import { createThreeTemplateService } from './templates';

import type { ThreeTemplateSummary } from '$lib/three/three-template-types';

export type ThreeEditorTemplateDemoPageData = ThreeEditorDemoPageData & {
	templates: ThreeTemplateSummary[];
};

export async function loadThreeEditorTemplateDemoData(options?: {
	rootDir?: string;
}): Promise<ThreeEditorTemplateDemoPageData> {
	const [editorData, templates] = await Promise.all([
		loadThreeEditorDemoData(options),
		createThreeTemplateService(options?.rootDir).listTemplates()
	]);

	return {
		...editorData,
		templates
	};
}
