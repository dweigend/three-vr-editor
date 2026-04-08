/**
 * Purpose: Load bundled preview code into the browser as a scene factory module.
 * Context: The editor preview rebuilds TypeScript on the server and swaps the resulting module in the browser.
 * Responsibility: Import Blob-backed ESM code, validate the expected scene export, and expose source-map metadata.
 * Boundaries: This module does not know anything about file persistence or Three runtime lifecycle.
 */

import type { ThreePreviewBuildSuccess } from './three-editor-types';
import type { ThreeDemoSceneFactory } from './three-demo-scene';

const SCENE_EXPORT_NAME = 'createDemoScene';

export type LoadedThreePreviewModule = {
	dispose: () => void;
	moduleUrl: string;
	sceneFactory: ThreeDemoSceneFactory;
	sourceMap: string;
};

type ThreePreviewModule = {
	createDemoScene?: unknown;
};

export async function loadThreePreviewModule(
	preview: ThreePreviewBuildSuccess
): Promise<LoadedThreePreviewModule> {
	const blob = new Blob([preview.code], { type: 'text/javascript' });
	const moduleUrl = URL.createObjectURL(blob);

	try {
		const module = (await import(/* @vite-ignore */ moduleUrl)) as ThreePreviewModule;
		const sceneFactory = module[SCENE_EXPORT_NAME];

		if (typeof sceneFactory !== 'function') {
			throw new Error(`Preview module must export a "${SCENE_EXPORT_NAME}" function.`);
		}

		return {
			dispose: () => {
				URL.revokeObjectURL(moduleUrl);
			},
			moduleUrl,
			sceneFactory: sceneFactory as ThreeDemoSceneFactory,
			sourceMap: preview.map
		};
	} catch (error) {
		URL.revokeObjectURL(moduleUrl);
		throw error;
	}
}
