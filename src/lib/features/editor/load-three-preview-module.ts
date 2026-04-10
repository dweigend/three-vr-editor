import type { ThreePreviewBuildSuccess } from './three-editor-types';
import type { ThreeDemoRendererKind, ThreeDemoSceneFactory } from './three-demo-scene';
import type { ThreeTemplateParameterMap } from './three-template-types';
import {
	THREE_MODULE_URL,
	THREE_WEBGPU_MODULE_URL,
	toAbsoluteThreeRuntimeModuleUrl
} from './three-runtime-module-urls';

const SCENE_EXPORT_NAME = 'createDemoScene';
const RENDERER_KIND_EXPORT_NAME = 'demoRendererKind';
const TEMPLATE_PARAMETERS_EXPORT_NAME = 'templateParameters';

export type LoadedThreePreviewModule = {
	applyTemplateParameters: (parameterValues: ThreeTemplateParameterMap | null) => void;
	dispose: () => void;
	moduleUrl: string;
	rendererKind: ThreeDemoRendererKind;
	sceneFactory: ThreeDemoSceneFactory;
	sourceMap: string;
};

type ThreePreviewModule = {
	createDemoScene?: unknown;
	demoRendererKind?: unknown;
	templateParameters?: unknown;
};

export async function loadThreePreviewModule(
	preview: ThreePreviewBuildSuccess
): Promise<LoadedThreePreviewModule> {
	const blob = new Blob([rewriteThreeRuntimeImportUrls(preview.code)], { type: 'text/javascript' });
	const moduleUrl = URL.createObjectURL(blob);

	try {
		const module = (await import(/* @vite-ignore */ moduleUrl)) as ThreePreviewModule;
		const sceneFactory = module[SCENE_EXPORT_NAME];

		if (typeof sceneFactory !== 'function') {
			throw new Error(`Preview module must export a "${SCENE_EXPORT_NAME}" function.`);
		}

		const rendererKind = readRendererKind(module[RENDERER_KIND_EXPORT_NAME]);
		const templateParameters = readTemplateParameters(module[TEMPLATE_PARAMETERS_EXPORT_NAME]);
		const initialTemplateParameters = cloneTemplateParameters(templateParameters);

		return {
			applyTemplateParameters: (parameterValues) => {
				applyTemplateParameterValues(
					templateParameters,
					initialTemplateParameters,
					parameterValues
				);
			},
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

function readTemplateParameters(value: unknown): ThreeTemplateParameterMap | null {
	if (!isTemplateParameterRecord(value)) {
		return null;
	}

	return value;
}

function cloneTemplateParameters(
	parameters: ThreeTemplateParameterMap | null
): ThreeTemplateParameterMap | null {
	if (!parameters) {
		return null;
	}

	return { ...parameters };
}

function applyTemplateParameterValues(
	templateParameters: ThreeTemplateParameterMap | null,
	initialTemplateParameters: ThreeTemplateParameterMap | null,
	parameterValues: ThreeTemplateParameterMap | null
): void {
	if (!templateParameters || !initialTemplateParameters) {
		return;
	}

	for (const key of Object.keys(templateParameters)) {
		if (!(key in initialTemplateParameters)) {
			delete templateParameters[key];
		}
	}

	for (const [key, value] of Object.entries(initialTemplateParameters)) {
		templateParameters[key] = value;
	}

	if (!parameterValues) {
		return;
	}

	for (const [key, value] of Object.entries(parameterValues)) {
		templateParameters[key] = value;
	}
}

function isTemplateParameterRecord(value: unknown): value is ThreeTemplateParameterMap {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}

	return Object.values(value).every(
		(entry) => typeof entry === 'number' || typeof entry === 'string'
	);
}

function rewriteThreeRuntimeImportUrls(code: string): string {
	const baseUrl = window.location.href;

	return code
		.replaceAll(
			THREE_MODULE_URL,
			toAbsoluteThreeRuntimeModuleUrl(THREE_MODULE_URL, baseUrl)
		)
		.replaceAll(
			THREE_WEBGPU_MODULE_URL,
			toAbsoluteThreeRuntimeModuleUrl(THREE_WEBGPU_MODULE_URL, baseUrl)
		);
}
