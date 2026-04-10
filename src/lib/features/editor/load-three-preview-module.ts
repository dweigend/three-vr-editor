import type { ThreePreviewBuildSuccess } from './three-editor-types';
import type { ThreeDemoRendererKind, ThreeDemoSceneFactory } from './three-demo-scene';

const SCENE_EXPORT_NAME = 'createDemoScene';
const RENDERER_KIND_EXPORT_NAME = 'demoRendererKind';

export type LoadedThreePreviewModule = {
	dispose: () => void;
	moduleUrl: string;
	rendererKind: ThreeDemoRendererKind;
	sceneFactory: ThreeDemoSceneFactory;
	sourceMap: string;
};

type ThreePreviewModule = {
	createDemoScene?: unknown;
	demoRendererKind?: unknown;
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

		const rendererKind = readRendererKind(module[RENDERER_KIND_EXPORT_NAME]);

		return {
			dispose: () => {
				URL.revokeObjectURL(moduleUrl);
			},
			moduleUrl,
			rendererKind,
			sceneFactory: sceneFactory as ThreeDemoSceneFactory,
			sourceMap: preview.map
		};
	} catch (error) {
		URL.revokeObjectURL(moduleUrl);
		throw error;
	}
}

function readRendererKind(value: unknown): ThreeDemoRendererKind {
	if (value === 'webgpu') {
		return 'webgpu';
	}

	return 'webgl';
}
