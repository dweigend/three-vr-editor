import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { WebGPURenderer } from 'three/webgpu';

import type {
	ThreeCompatibleRenderer,
	ThreeDemoRendererKind,
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from './three-demo-scene';
import {
	THREE_MODULE_URL,
	THREE_WEBGPU_MODULE_URL,
	toAbsoluteThreeRuntimeModuleUrl
} from './three-runtime-module-urls';

export type CreateThreeRuntimeOptions = {
	container: HTMLDivElement;
	onRuntimeError: (error: unknown) => void;
	rendererKind?: ThreeDemoRendererKind;
	sceneFactory: ThreeDemoSceneFactory;
};

export type ThreeRuntimeController = {
	dispose: () => void;
};

type ThreeWebGlModule = typeof import('three');
type ThreeWebGpuModule = typeof import('three/webgpu');

const CAMERA_FAR = 100;
const CAMERA_FOV = 60;
const CAMERA_NEAR = 0.1;
const FALLBACK_HEIGHT = 360;
const FALLBACK_WIDTH = 640;
const MAX_PIXEL_RATIO = 2;

let threeWebGlModulePromise: Promise<ThreeWebGlModule> | null = null;
let threeWebGpuModulePromise: Promise<ThreeWebGpuModule> | null = null;

export function createThreeRuntime(options: CreateThreeRuntimeOptions): ThreeRuntimeController {
	const { container, onRuntimeError, rendererKind = 'webgl', sceneFactory } = options;

	let animationFrameId = 0;
	let camera: PerspectiveCamera | null = null;
	let isDisposed = false;
	let renderer: ThreeCompatibleRenderer | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let scene: Scene | null = null;
	let sceneController: ThreeDemoSceneController | null = null;

	const updateSize = (): void => {
		if (!camera) {
			return;
		}

		const width = container.clientWidth || FALLBACK_WIDTH;
		const height = container.clientHeight || FALLBACK_HEIGHT;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer?.setSize(width, height, false);
		sceneController?.resize?.({ height, width });
	};

	const dispose = (): void => {
		if (isDisposed) {
			return;
		}

		isDisposed = true;
		window.cancelAnimationFrame(animationFrameId);
		resizeObserver?.disconnect();
		sceneController?.dispose();
		renderer?.dispose();
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
			sceneController?.update();
			sceneController?.render?.() ?? renderer?.render(scene!, camera!);
			animationFrameId = window.requestAnimationFrame(renderFrame);
		} catch (error) {
			fail(error);
		}
	};

	void initialize();

	return { dispose };

	async function initialize(): Promise<void> {
		try {
			const runtimeParts = await createRuntimeParts(rendererKind);
			const nextRenderer = runtimeParts.renderer;

			camera = runtimeParts.camera;
			scene = runtimeParts.scene;

			nextRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
			container.replaceChildren(nextRenderer.domElement);
			renderer = nextRenderer;

			if (rendererKind === 'webgpu') {
				await (nextRenderer as WebGPURenderer).init();
			}

			if (isDisposed) {
				nextRenderer.dispose();
				return;
			}

			sceneController = sceneFactory({
				camera,
				container,
				renderer: nextRenderer,
				rendererKind,
				scene
			});

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
		} catch (error) {
			fail(error);
		}
	}
}

async function createRuntimeParts(rendererKind: ThreeDemoRendererKind): Promise<{
	camera: PerspectiveCamera;
	renderer: ThreeCompatibleRenderer;
	scene: Scene;
}> {
	if (rendererKind === 'webgpu') {
		const THREE = await loadThreeWebGpuModule();

		return {
			camera: new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR),
			renderer: new THREE.WebGPURenderer({ antialias: true }),
			scene: new THREE.Scene()
		};
	}

	const THREE = await loadThreeWebGlModule();

	return {
		camera: new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR),
		renderer: new THREE.WebGLRenderer({ antialias: true, alpha: false }),
		scene: new THREE.Scene()
	};
}

function loadThreeWebGlModule(): Promise<ThreeWebGlModule> {
	threeWebGlModulePromise ??=
		import(
			/* @vite-ignore */ toAbsoluteThreeRuntimeModuleUrl(THREE_MODULE_URL, window.location.href)
		) as Promise<ThreeWebGlModule>;

	return threeWebGlModulePromise;
}

function loadThreeWebGpuModule(): Promise<ThreeWebGpuModule> {
	threeWebGpuModulePromise ??=
		import(
			/* @vite-ignore */ toAbsoluteThreeRuntimeModuleUrl(
				THREE_WEBGPU_MODULE_URL,
				window.location.href
			)
		) as Promise<ThreeWebGpuModule>;

	return threeWebGpuModulePromise;
}
