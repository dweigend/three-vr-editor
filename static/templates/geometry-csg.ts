/**
 * Purpose: Provide a compact CSG scene template inspired by the official geometry CSG example.
 * Context: This template demonstrates additive, subtractive, and intersection boolean operations with a single managed file.
 * Responsibility: Build two brushes, evaluate the selected CSG operation, and animate the resulting mesh.
 * Boundaries: The shared runtime owns renderer selection, resize handling, and file persistence.
 */

/* @three-template
{
	"id": "geometry-csg",
	"title": "Geometry CSG",
	"description": "A simplified boolean-geometry scene using three-bvh-csg.",
	"rendererKind": "webgl",
	"tags": ["geometry", "csg", "boolean"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#09090b" },
		{ "key": "surfaceColor", "label": "Surface color", "control": "color", "defaultValue": "#f97316" },
		{ "key": "operation", "label": "Operation", "control": "select", "defaultValue": "subtract", "options": [
			{ "label": "Subtract", "value": "subtract" },
			{ "label": "Intersect", "value": "intersect" },
			{ "label": "Union", "value": "union" }
		] },
		{ "key": "cutterOffset", "label": "Cutter offset", "control": "range", "min": -0.4, "max": 0.8, "step": 0.05, "defaultValue": 0.2 }
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
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#09090b",
	"cutterOffset": 0.2,
	"operation": "subtract",
	"surfaceColor": "#f97316"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

const evaluator = new Evaluator();

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const material = new MeshStandardMaterial({
		color: String(templateParameters.surfaceColor),
		metalness: 0.08,
		roughness: 0.35
	});
	const baseBrush = new Brush(new BoxGeometry(2.2, 1.6, 1.6), material);
	const cutterBrush = new Brush(new SphereGeometry(0.95, 32, 24), material);
	const ambientLight = new AmbientLight('#ffffff', 1.8);
	const directionalLight = new DirectionalLight('#ffffff', 3);

	scene.background = new Color(String(templateParameters.background));
	camera.position.set(0, 0.4, 4.5);
	directionalLight.position.set(4, 5, 6);

	cutterBrush.position.x = Number(templateParameters.cutterOffset);
	baseBrush.updateMatrixWorld(true);
	cutterBrush.updateMatrixWorld(true);

	const operation = readOperation(String(templateParameters.operation));
	const result = evaluator.evaluate(baseBrush, cutterBrush, operation) as Mesh;

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(result);

	return {
		update: () => {
			result.rotation.x += 0.005;
			result.rotation.y += 0.01;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(result);
			baseBrush.geometry.dispose();
			cutterBrush.geometry.dispose();
			material.dispose();
			result.geometry.dispose();
		}
	};
};

function readOperation(value: string) {
	if (value === 'intersect') {
		return INTERSECTION;
	}

	if (value === 'union') {
		return ADDITION;
	}

	return SUBTRACTION;
}
