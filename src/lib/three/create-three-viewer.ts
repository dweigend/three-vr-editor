/**
 * Purpose: Build a minimal, self-contained Three.js renderer for the local demo page.
 * Context: The repository needs a small smoke-test viewer before any editor or multi-file preview integration.
 * Responsibility: Create the scene, mount the renderer, animate a cube, react to resizes, and clean up resources.
 * Boundaries: This module owns only the demo renderer lifecycle; UI state and error rendering stay in Svelte components.
 */

import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three';

export type CreateThreeViewerOptions = {
	container: HTMLDivElement;
	onRuntimeError: (error: unknown) => void;
};

export type ThreeViewerController = {
	dispose: () => void;
};

const CAMERA_FOV = 60;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_Z = 3.5;
const AMBIENT_LIGHT_INTENSITY = 2.2;
const DIRECTIONAL_LIGHT_INTENSITY = 2.8;
const ROTATION_X_STEP = 0.01;
const ROTATION_Y_STEP = 0.015;
const MAX_PIXEL_RATIO = 2;
const FALLBACK_WIDTH = 640;
const FALLBACK_HEIGHT = 360;

export function createThreeViewer(options: CreateThreeViewerOptions): ThreeViewerController {
	const { container, onRuntimeError } = options;
	const scene = new Scene();
	const camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
	const renderer = new WebGLRenderer({ antialias: true, alpha: false });
	const geometry = new BoxGeometry(1.2, 1.2, 1.2);
	const material = new MeshStandardMaterial({ color: '#7dd3fc', roughness: 0.35, metalness: 0.12 });
	const cube = new Mesh(geometry, material);
	const ambientLight = new AmbientLight('#ffffff', AMBIENT_LIGHT_INTENSITY);
	const directionalLight = new DirectionalLight('#ffffff', DIRECTIONAL_LIGHT_INTENSITY);

	let animationFrameId = 0;
	let isDisposed = false;
	let resizeObserver: ResizeObserver | null = null;

	scene.background = new Color('#020617');
	camera.position.z = CAMERA_Z;
	directionalLight.position.set(3, 4, 5);
	cube.rotation.x = 0.35;
	cube.rotation.y = 0.2;

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(cube);

	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
	container.replaceChildren(renderer.domElement);

	const updateSize = (): void => {
		const width = container.clientWidth || FALLBACK_WIDTH;
		const height = container.clientHeight || FALLBACK_HEIGHT;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
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
			cube.rotation.x += ROTATION_X_STEP;
			cube.rotation.y += ROTATION_Y_STEP;
			renderer.render(scene, camera);
			animationFrameId = window.requestAnimationFrame(renderFrame);
		} catch (error) {
			fail(error);
		}
	};

	const dispose = (): void => {
		if (isDisposed) {
			return;
		}

		isDisposed = true;
		window.cancelAnimationFrame(animationFrameId);
		resizeObserver?.disconnect();
		geometry.dispose();
		material.dispose();
		renderer.dispose();
		container.replaceChildren();
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
