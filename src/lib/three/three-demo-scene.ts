/**
 * Purpose: Define the shared contract between the generic viewer host and specific Three demo scenes.
 * Context: Scene logic should be movable into dedicated files without coupling those files to Svelte UI details.
 * Responsibility: Expose explicit types for scene setup, renderer selection, per-frame updates, and cleanup.
 * Boundaries: This file contains only types and no runtime scene implementation.
 */

import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { WebGPURenderer } from 'three/webgpu';

export type ThreeDemoRendererKind = 'webgl' | 'webgpu';

export type ThreeCompatibleRenderer = WebGLRenderer | WebGPURenderer;

export type ThreeDemoSceneContext = {
	camera: PerspectiveCamera;
	container: HTMLDivElement;
	renderer: ThreeCompatibleRenderer;
	rendererKind: ThreeDemoRendererKind;
	scene: Scene;
};

export type ThreeDemoSceneController = {
	dispose: () => void;
	render?: () => void;
	resize?: (size: { height: number; width: number }) => void;
	update: () => void;
};

export type ThreeDemoSceneFactory = (context: ThreeDemoSceneContext) => ThreeDemoSceneController;
