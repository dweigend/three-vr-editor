/**
 * Purpose: Create a reusable Three.js runtime shell for demo scenes.
 * Context: Multiple pages and preview variants should share the same renderer, resize, and cleanup behavior.
 * Responsibility: Mount a renderer, run a scene factory, animate frames, and dispose resources safely.
 * Boundaries: This module does not load source files or decide which scene module should be rendered.
 */

import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import type { ThreeDemoSceneFactory } from './three-demo-scene';

export type CreateThreeRuntimeOptions = {
	container: HTMLDivElement;
	onRuntimeError: (error: unknown) => void;
	sceneFactory: ThreeDemoSceneFactory;
};

export type ThreeRuntimeController = {
	dispose: () => void;
};

const CAMERA_FAR = 100;
const CAMERA_FOV = 60;
const CAMERA_NEAR = 0.1;
const FALLBACK_HEIGHT = 360;
const FALLBACK_WIDTH = 640;
const MAX_PIXEL_RATIO = 2;

export function createThreeRuntime(options: CreateThreeRuntimeOptions): ThreeRuntimeController {
	const { container, onRuntimeError, sceneFactory } = options;
	const scene = new Scene();
	const camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
	const renderer = new WebGLRenderer({ antialias: true, alpha: false });
	const sceneController = sceneFactory({ camera, scene });

	let animationFrameId = 0;
	let isDisposed = false;
	let resizeObserver: ResizeObserver | null = null;

	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
	container.replaceChildren(renderer.domElement);

	const updateSize = (): void => {
		const width = container.clientWidth || FALLBACK_WIDTH;
		const height = container.clientHeight || FALLBACK_HEIGHT;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
	};

	const dispose = (): void => {
		if (isDisposed) {
			return;
		}

		isDisposed = true;
		window.cancelAnimationFrame(animationFrameId);
		resizeObserver?.disconnect();
		sceneController.dispose();
		renderer.dispose();
		container.replaceChildren();
	};

	const fail = (error: unknown): void => {
		if (isDisposed) {
			return;
		}

		dispose();
		onRuntimeError(error);
	};

	const renderFrame = (): void => {
		if (isDisposed) {
			return;
		}

		try {
			sceneController.update();
			renderer.render(scene, camera);
			animationFrameId = window.requestAnimationFrame(renderFrame);
		} catch (error) {
			fail(error);
		}
	};

	updateSize();
	resizeObserver = new ResizeObserver(() => {
		try {
			updateSize();
		} catch (error) {
			fail(error);
		}
	});
	resizeObserver.observe(container);
	renderFrame();

	return { dispose };
}
