/**
 * Purpose: Load the additive Three template workbench demo route.
 * Context: This route keeps the original editor demos intact while exposing the next stage with templates and dynamic parameters.
 * Responsibility: Return the shared editor bootstrap data plus the managed template summaries.
 * Boundaries: Ongoing read, save, create, and preview requests live in dedicated JSON endpoints.
 */

import { loadThreeEditorTemplateDemoData } from '$lib/server/three/editor-template-demo-load';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => loadThreeEditorTemplateDemoData();
