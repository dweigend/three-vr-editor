import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { WebGPURenderer } from 'three/webgpu';

import type {
	ThreeCompatibleRenderer,
	ThreeDemoRendererKind,
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from './three-demo-scene';

export type CreateThreeRuntimeOptions = {
	container: HTMLDivElement;
	onRuntimeError: (error: unknown) => void;
	rendererKind?: ThreeDemoRendererKind;
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
	const { container, onRuntimeError, rendererKind = 'webgl', sceneFactory } = options;
	const scene = new Scene();
	const camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);

	let animationFrameId = 0;
	let isDisposed = false;
	let renderer: ThreeCompatibleRenderer | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let sceneController: ThreeDemoSceneController | null = null;

	const updateSize = (): void => {
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
			sceneController?.render?.() ?? renderer?.render(scene, camera);
			animationFrameId = window.requestAnimationFrame(renderFrame);
		} catch (error) {
			fail(error);
		}
	};

	void initialize();

	return { dispose };

	async function initialize(): Promise<void> {
		try {
			const nextRenderer = createRenderer(rendererKind);

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

function createRenderer(rendererKind: ThreeDemoRendererKind): ThreeCompatibleRenderer {
	if (rendererKind === 'webgpu') {
		return new WebGPURenderer({ antialias: true });
	}

	return new WebGLRenderer({ antialias: true, alpha: false });
}
