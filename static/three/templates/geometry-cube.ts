/**
 * Purpose: Provide a template-friendly cube scene inspired by the Three.js geometry cube example.
 * Context: The template workbench uses this file as a managed scene starter with optional parameter controls.
 * Responsibility: Define one rotating cube scene with a small lighting rig and cleanup logic.
 * Boundaries: The shared runtime owns renderer creation, resize handling, and route-specific UI.
 */

/* @three-template
{
	"id": "geometry-cube",
	"title": "Geometry Cube",
	"description": "A minimal rotating cube scene inspired by the official geometry cube example.",
	"rendererKind": "webgl",
	"tags": ["geometry", "cube", "starter"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#020617" },
		{ "key": "cubeColor", "label": "Cube color", "control": "color", "defaultValue": "#60a5fa" },
		{ "key": "cubeSize", "label": "Cube size", "control": "range", "min": 0.8, "max": 2.2, "step": 0.1, "defaultValue": 1.4 },
		{ "key": "spinSpeed", "label": "Spin speed", "control": "range", "min": 0.002, "max": 0.03, "step": 0.001, "defaultValue": 0.01 }
	]
}
*/

import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"cubeColor": "#60a5fa",
	"cubeSize": 1.4,
	"spinSpeed": 0.01
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const geometry = new BoxGeometry(
		Number(templateParameters.cubeSize),
		Number(templateParameters.cubeSize),
		Number(templateParameters.cubeSize)
	);
	const material = new MeshStandardMaterial({
		color: String(templateParameters.cubeColor),
		metalness: 0.2,
		roughness: 0.38
	});
	const cube = new Mesh(geometry, material);
	const ambientLight = new AmbientLight('#ffffff', 2.2);
	const directionalLight = new DirectionalLight('#ffffff', 2.8);

	scene.background = new Color(String(templateParameters.background));
	camera.position.set(0, 0.6, 3.8);
	directionalLight.position.set(3, 4, 5);

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(cube);

	return {
		update: () => {
			const spinSpeed = Number(templateParameters.spinSpeed);
			cube.rotation.x += spinSpeed * 0.8;
			cube.rotation.y += spinSpeed;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(cube);
			geometry.dispose();
			material.dispose();
		}
	};
};
