/**
 * Purpose: Load the initial state for the Three editor demo with the Pi agent panel.
 * Context: The route combines the shared editor bootstrap data with Pi availability metadata.
 * Responsibility: Return editor workspace data plus the active Pi key and model status.
 * Boundaries: Pi requests run through the dedicated JSON endpoint, not through this page load.
 */

import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import { getConfiguredModel } from '$lib/server/pi/models';
import { loadThreeEditorPageData } from '$lib/server/three/editor-page-load';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const editorData = await loadThreeEditorPageData();

	return {
		...editorData,
		configuredModel: getConfiguredModel(),
		hasActiveKey: hasActiveOpenRouterKey()
	};
};
