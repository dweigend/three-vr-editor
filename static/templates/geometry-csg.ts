import {
	ADDITION,
	Brush,
	Evaluator,
	INTERSECTION,
	SUBTRACTION
} from 'three-bvh-csg';
import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	SphereGeometry,
	type PerspectiveCamera,
	type Scene
} from 'three';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';
export const templateUi = defineThreeTemplateUi({
	"id": "geometry-csg",
	"title": "Geometry CSG",
	"description": "Move the cutter and switch the boolean operation.",
	"rendererKind": "webgl",
	"tags": ["geometry", "csg", "boolean"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#09090b"
		},
		{
			"key": "surfaceColor",
			"label": "Surface color",
			"control": "color",
			"defaultValue": "#f97316"
		},
		{
			"key": "operation",
			"label": "Operation",
			"control": "select",
			"defaultValue": "subtract",
			"options": [
				{ "label": "Subtract", "value": "subtract" },
				{ "label": "Intersect", "value": "intersect" },
				{ "label": "Union", "value": "union" }
			]
		},
		{
			"key": "cutterOffset",
			"label": "Cutter offset",
			"control": "range",
			"min": -0.4,
			"max": 0.8,
			"step": 0.05,
			"defaultValue": 0.2
		}
	]
});
export const templateParameters = defineThreeTemplateParameters({
	"background": "#09090b",
	"cutterOffset": 0.2,
	"operation": "subtract",
	"surfaceColor": "#f97316"
});

const evaluator = new Evaluator();

type CsgOperationKey = 'intersect' | 'subtract' | 'union';

type CsgSettings = {
	background: string;
	cutterOffset: number;
	operation: CsgOperationKey;
	surfaceColor: string;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readCsgSettings();
	const surfaceMaterial = new MeshStandardMaterial({
		color: settings.surfaceColor,
		metalness: 0.08,
		roughness: 0.35
	});
	const baseBrush = new Brush(new BoxGeometry(2.2, 1.6, 1.6), surfaceMaterial);
	const cutterBrush = new Brush(
		new SphereGeometry(0.95, 32, 24),
		surfaceMaterial
	);
	const sceneLights = createSceneLights();
	const resultMesh = buildResultMesh(baseBrush, cutterBrush, settings);

	setupScene(camera, scene, settings.background, resultMesh, sceneLights);

	return {
		update: () => {
			resultMesh.rotation.x += 0.005;
			resultMesh.rotation.y += 0.01;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(resultMesh);
			baseBrush.geometry.dispose();
			cutterBrush.geometry.dispose();
			resultMesh.geometry.dispose();
			surfaceMaterial.dispose();
		}
	};
};

function readCsgSettings(): CsgSettings {
	return {
		background: String(templateParameters.background),
		cutterOffset: Number(templateParameters.cutterOffset),
		operation: readOperationKey(String(templateParameters.operation)),
		surfaceColor: String(templateParameters.surfaceColor)
	};
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 1.8),
		directionalLight: new DirectionalLight('#ffffff', 3)
	};
}

function buildResultMesh(
	baseBrush: Brush,
	cutterBrush: Brush,
	settings: CsgSettings
): Mesh {
	cutterBrush.position.x = settings.cutterOffset;
	baseBrush.updateMatrixWorld(true);
	cutterBrush.updateMatrixWorld(true);

	// This is the main CSG step: two meshes go in, one new result mesh comes out.
	return evaluator.evaluate(
		baseBrush,
		cutterBrush,
		readEvaluatorOperation(settings.operation)
	) as Mesh;
}

function setupScene(
	camera: PerspectiveCamera,
	scene: Scene,
	background: string,
	resultMesh: Mesh,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	camera.position.set(0, 0.4, 4.5);
	sceneLights.directionalLight.position.set(4, 5, 6);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(resultMesh);
}

function readOperationKey(value: string): CsgOperationKey {
	if (value === 'intersect' || value === 'union') {
		return value;
	}

	return 'subtract';
}

function readEvaluatorOperation(operation: CsgOperationKey) {
	if (operation === 'intersect') {
		return INTERSECTION;
	}

	if (operation === 'union') {
		return ADDITION;
	}

	return SUBTRACTION;
}
