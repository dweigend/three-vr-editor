/**
 * Purpose: Load the initial state for the standalone Three editor demo page.
 * Context: The page reuses the shared editor-demo bootstrap so it stays aligned with other editor variants.
 * Responsibility: Return the managed file list, initial document, and initial preview payload.
 * Boundaries: Ongoing file reads, saves, and preview rebuilds live in dedicated endpoint routes.
 */

import { loadThreeEditorDemoData } from '$lib/server/three/editor-demo-load';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => loadThreeEditorDemoData();
