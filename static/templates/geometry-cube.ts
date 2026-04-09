/**
 * Purpose: Teach the smallest possible lit cube scene with a few friendly controls.
 * Context: Students can use this template to learn the shared scene contract and try
 * one geometry, one material, and two lights without extra setup.
 * Responsibility: Build the cube scene, animate it, and clean up all created resources.
 * Boundaries: The shared runtime still owns the renderer, resize handling, and editor UI.
 */

/* @three-template
{
	"id": "geometry-cube",
	"title": "Geometry Cube",
	"description": "A minimal rotating cube scene for learning the template format.",
	"rendererKind": "webgl",
	"tags": ["geometry", "cube", "starter"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#020617"
		},
		{
			"key": "cubeColor",
			"label": "Cube color",
			"control": "color",
			"defaultValue": "#60a5fa"
		},
		{
			"key": "cubeSize",
			"label": "Cube size",
			"control": "range",
			"min": 0.8,
			"max": 2.2,
			"step": 0.1,
			"defaultValue": 1.4
		},
		{
			"key": "spinSpeed",
			"label": "Spin speed",
			"control": "range",
			"min": 0.002,
			"max": 0.03,
			"step": 0.001,
			"defaultValue": 0.01
		}
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
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"cubeColor": "#60a5fa",
	"cubeSize": 1.4,
	"spinSpeed": 0.01
} satisfies Record<string, number | string>;
// @three-template-parameters:end

type CubeSceneSettings = {
	background: string;
	cubeColor: string;
	cubeSize: number;
	spinSpeed: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readCubeSceneSettings();
	const cubeGeometry = createCubeGeometry(settings);
	const cubeMaterial = createCubeMaterial(settings);
	const cubeMesh = new Mesh(cubeGeometry, cubeMaterial);
	const sceneLights = createSceneLights();

	configureScene(camera, scene, settings, cubeMesh, sceneLights);

	return {
		update: () => {
			spinCube(cubeMesh, settings.spinSpeed);
		},
		dispose: () => {
			cleanupScene(scene, cubeMesh, sceneLights);
			cubeGeometry.dispose();
			cubeMaterial.dispose();
		}
	};
};

function readCubeSceneSettings(): CubeSceneSettings {
	return {
		background: String(templateParameters.background),
		cubeColor: String(templateParameters.cubeColor),
		cubeSize: Number(templateParameters.cubeSize),
		spinSpeed: Number(templateParameters.spinSpeed)
	};
}

function createCubeGeometry(settings: CubeSceneSettings): BoxGeometry {
	return new BoxGeometry(settings.cubeSize, settings.cubeSize, settings.cubeSize);
}

function createCubeMaterial(settings: CubeSceneSettings): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: settings.cubeColor,
		metalness: 0.2,
		roughness: 0.38
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 2.2),
		directionalLight: new DirectionalLight('#ffffff', 2.8)
	};
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	settings: CubeSceneSettings,
	cubeMesh: Mesh,
	sceneLights: SceneLights
): void {
	scene.background = new Color(settings.background);
	camera.position.set(0, 0.6, 3.8);
	sceneLights.directionalLight.position.set(3, 4, 5);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(cubeMesh);
}

function spinCube(cubeMesh: Mesh, spinSpeed: number): void {
	cubeMesh.rotation.x += spinSpeed * 0.8;
	cubeMesh.rotation.y += spinSpeed;
}

function cleanupScene(
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	cubeMesh: Mesh,
	sceneLights: SceneLights
): void {
	scene.remove(sceneLights.ambientLight);
	scene.remove(sceneLights.directionalLight);
	scene.remove(cubeMesh);
}
