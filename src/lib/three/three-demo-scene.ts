/**
 * Purpose: Define the shared contract between the generic viewer host and specific Three demo scenes.
 * Context: Scene logic should be movable into dedicated files without coupling those files to Svelte UI details.
 * Responsibility: Expose explicit types for scene setup, per-frame updates, and cleanup.
 * Boundaries: This file contains only types and no runtime scene implementation.
 */

import type { PerspectiveCamera, Scene } from 'three';

export type ThreeDemoSceneContext = {
	camera: PerspectiveCamera;
	scene: Scene;
};

export type ThreeDemoSceneController = {
	dispose: () => void;
	update: () => void;
};

export type ThreeDemoSceneFactory = (context: ThreeDemoSceneContext) => ThreeDemoSceneController;
