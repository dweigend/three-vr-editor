/**
 * Purpose: Teach the idea of constructive solid geometry with one simple boolean result.
 * Context: Students can switch between subtract, intersect, and union to see how two
 * shapes combine into a new mesh.
 * Responsibility: Build the source brushes, evaluate one CSG operation, animate the
 * result, and release the created resources.
 * Boundaries: The template keeps the setup compact and does not expose the full
 * example UI.
 */

/* @three-template
{
	"id": "geometry-csg",
	"title": "Geometry CSG",
	"description": "A simple boolean-geometry scene with one box and one sphere.",
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
}
*/

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
	SphereGeometry
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#09090b",
	"cutterOffset": 0.2,
	"operation": "subtract",
	"surfaceColor": "#f97316"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

const evaluator = new Evaluator();

type CsgOperationKey = 'intersect' | 'subtract' | 'union';

type CsgSceneSettings = {
	background: string;
	cutterOffset: number;
	operation: CsgOperationKey;
	surfaceColor: string;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readCsgSceneSettings();
	const surfaceMaterial = createSurfaceMaterial(settings.surfaceColor);
	const baseBrush = new Brush(new BoxGeometry(2.2, 1.6, 1.6), surfaceMaterial);
	const cutterBrush = new Brush(new SphereGeometry(0.95, 32, 24), surfaceMaterial);
	const sceneLights = createSceneLights();
	const resultMesh = buildResultMesh(baseBrush, cutterBrush, settings);

	configureScene(camera, scene, settings.background, resultMesh, sceneLights);

	return {
		update: () => {
			spinMesh(resultMesh);
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

function readCsgSceneSettings(): CsgSceneSettings {
	return {
		background: String(templateParameters.background),
		cutterOffset: Number(templateParameters.cutterOffset),
		operation: readOperationKey(String(templateParameters.operation)),
		surfaceColor: String(templateParameters.surfaceColor)
	};
}

function createSurfaceMaterial(surfaceColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: surfaceColor,
		metalness: 0.08,
		roughness: 0.35
	});
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
	settings: CsgSceneSettings
): Mesh {
	cutterBrush.position.x = settings.cutterOffset;
	baseBrush.updateMatrixWorld(true);
	cutterBrush.updateMatrixWorld(true);

	return evaluator.evaluate(
		baseBrush,
		cutterBrush,
		readEvaluatorOperation(settings.operation)
	) as Mesh;
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
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

function spinMesh(resultMesh: Mesh): void {
	resultMesh.rotation.x += 0.005;
	resultMesh.rotation.y += 0.01;
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
