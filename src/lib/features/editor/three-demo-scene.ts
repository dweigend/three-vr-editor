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
