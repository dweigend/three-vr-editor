/**
 * Purpose: Prepare stable route data for the minimal Three.js demo page.
 * Context: The demo should know where future static Three assets live without hardcoding URLs in the component tree.
 * Responsibility: Return typed metadata and the static asset base path for the viewer route.
 * Boundaries: This loader does not read files from disk or expose a manifest API.
 */

import { base } from '$app/paths';

import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		assetBaseUrl: `${base}/three`,
		cubeSourceUrl: `${base}/three/cube.ts`,
		title: 'Three.js demo viewer',
		description: 'A minimal rotating cube that keeps runtime errors inside the viewer panel.'
	};
};
