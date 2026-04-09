/** Start here if you want a lit cube you can tweak right away. */

import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	type PerspectiveCamera,
	type Scene
} from 'three';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';

// The editor sidebar reads this to build the labels and controls.
export const templateUi = defineThreeTemplateUi({
	"id": "geometry-cube",
	"title": "Geometry Cube",
	"description": "A simple cube with color, size, and spin controls.",
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
});

// These are the values students can play with first.
export const templateParameters = defineThreeTemplateParameters({
	"background": "#020617",
	"cubeColor": "#60a5fa",
	"cubeSize": 1.4,
	"spinSpeed": 0.01
});

type CubeSettings = {
	background: string;
	cubeColor: string;
	cubeSize: number;
	spinSpeed: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readCubeSettings();
	const cubeGeometry = new BoxGeometry(
		settings.cubeSize,
		settings.cubeSize,
		settings.cubeSize
	);
	const cubeMaterial = new MeshStandardMaterial({
		color: settings.cubeColor,
		metalness: 0.2,
		roughness: 0.38
	});
	const cubeMesh = new Mesh(cubeGeometry, cubeMaterial);
	const sceneLights = createSceneLights();

	setupScene(camera, scene, settings.background, cubeMesh, sceneLights);

	return {
		update: () => {
			cubeMesh.rotation.x += settings.spinSpeed * 0.8;
			cubeMesh.rotation.y += settings.spinSpeed;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(cubeMesh);
			cubeGeometry.dispose();
			cubeMaterial.dispose();
		}
	};
};

function readCubeSettings(): CubeSettings {
	return {
		background: String(templateParameters.background),
		cubeColor: String(templateParameters.cubeColor),
		cubeSize: Number(templateParameters.cubeSize),
		spinSpeed: Number(templateParameters.spinSpeed)
	};
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 2.2),
		directionalLight: new DirectionalLight('#ffffff', 2.8)
	};
}

function setupScene(
	camera: PerspectiveCamera,
	scene: Scene,
	background: string,
	cubeMesh: Mesh,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	camera.position.set(0, 0.6, 3.8);
	sceneLights.directionalLight.position.set(3, 4, 5);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(cubeMesh);
}
