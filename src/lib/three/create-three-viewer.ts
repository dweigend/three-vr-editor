/**
 * Purpose: Keep the existing simple viewer API by mounting the default cube scene into the shared runtime shell.
 * Context: The repository still exposes a fixed Three.js viewer alongside the new editor-driven preview workflow.
 * Responsibility: Delegate the default cube scene to the reusable runtime without exposing editor-specific concerns.
 * Boundaries: This module is a thin compatibility wrapper and does not own preview builds or editor state.
 */

import { createDemoScene } from '../../../static/three/cube';

import { createThreeRuntime, type CreateThreeRuntimeOptions, type ThreeRuntimeController } from './create-three-runtime';

export type CreateThreeViewerOptions = {
	container: HTMLDivElement;
	onRuntimeError: (error: unknown) => void;
};

export type ThreeViewerController = ThreeRuntimeController;

export function createThreeViewer(options: CreateThreeViewerOptions): ThreeViewerController {
	return createThreeRuntime({
		...options,
		sceneFactory: createDemoScene
	} satisfies CreateThreeRuntimeOptions);
}
