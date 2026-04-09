/** Start here if you want baked-looking lighting without loading any textures. */

import * as THREE from 'three/webgpu';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';

// The editor sidebar reads this to build the labels and controls.
export const templateUi = defineThreeTemplateUi({
	"id": "materials-lightmap",
	"title": "Materials Lightmap",
	"description": "A procedural light-map scene with one box and one floor.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "materials", "lightmap"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#111827"
		},
		{
			"key": "baseColor",
			"label": "Base color",
			"control": "color",
			"defaultValue": "#e5e7eb"
		},
		{
			"key": "lightMapIntensity",
			"label": "Lightmap intensity",
			"control": "range",
			"min": 0.2,
			"max": 3,
			"step": 0.1,
			"defaultValue": 1.4
		},
		{
			"key": "accentColor",
			"label": "Accent color",
			"control": "color",
			"defaultValue": "#60a5fa"
		}
	]
});

// These are the values students can play with first.
export const templateParameters = defineThreeTemplateParameters({
	"accentColor": "#60a5fa",
	"background": "#111827",
	"baseColor": "#e5e7eb",
	"lightMapIntensity": 1.4
});

export const demoRendererKind = 'webgpu';

type LightMapSettings = {
	accentColor: string;
	background: string;
	baseColor: string;
	lightMapIntensity: number;
};

type SceneLights = {
	ambientLight: THREE.AmbientLight;
	directionalLight: THREE.DirectionalLight;
};

type LightMapBox = THREE.Mesh<
	THREE.BoxGeometry,
	THREE.MeshStandardMaterial
>;

type LightMapFloor = THREE.Mesh<
	THREE.PlaneGeometry,
	THREE.MeshStandardMaterial
>;

type LightMapScene = {
	boxMesh: LightMapBox;
	floorMesh: LightMapFloor;
	lightMapTexture: THREE.CanvasTexture;
};

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readLightMapSettings();
	const lightMapScene = createLightMapScene(settings);
	const sceneLights = createSceneLights();

	setupScene(camera, scene, settings.background, lightMapScene, sceneLights);

	return {
		update: () => {
			lightMapScene.boxMesh.rotation.y += 0.008;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(lightMapScene.floorMesh);
			scene.remove(lightMapScene.boxMesh);
			lightMapScene.lightMapTexture.dispose();
			lightMapScene.floorMesh.geometry.dispose();
			lightMapScene.boxMesh.geometry.dispose();
			lightMapScene.floorMesh.material.dispose();
			lightMapScene.boxMesh.material.dispose();
		}
	};
};

function readLightMapSettings(): LightMapSettings {
	return {
		accentColor: String(templateParameters.accentColor),
		background: String(templateParameters.background),
		baseColor: String(templateParameters.baseColor),
		lightMapIntensity: Number(templateParameters.lightMapIntensity)
	};
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new THREE.AmbientLight('#ffffff', 1.2),
		directionalLight: new THREE.DirectionalLight('#ffffff', 1.8)
	};
}

function createLightMapScene(settings: LightMapSettings): LightMapScene {
	const lightMapTexture = createLightMapTexture(settings.accentColor);
	const boxMesh = createBoxMesh(settings, lightMapTexture);
	const floorMesh = createFloorMesh();

	return {
		boxMesh,
		floorMesh,
		lightMapTexture
	};
}

function createBoxMesh(
	settings: LightMapSettings,
	lightMapTexture: THREE.CanvasTexture
): LightMapBox {
	const boxGeometry = new THREE.BoxGeometry(2, 2.6, 2);
	const boxMaterial = new THREE.MeshStandardMaterial({
		color: settings.baseColor,
		lightMap: lightMapTexture,
		lightMapIntensity: settings.lightMapIntensity,
		metalness: 0.02,
		roughness: 0.86
	});

	copyLightMapUvChannel(boxGeometry);

	return new THREE.Mesh(boxGeometry, boxMaterial);
}

function createFloorMesh(): LightMapFloor {
	const floorMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(8, 8),
		new THREE.MeshStandardMaterial({
			color: '#1f2937',
			metalness: 0,
			roughness: 0.92
		})
	);

	floorMesh.rotation.x = -Math.PI / 2;
	floorMesh.position.y = -1.3;

	return floorMesh;
}

function setupScene(
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
	background: string,
	lightMapScene: LightMapScene,
	sceneLights: SceneLights
): void {
	scene.background = new THREE.Color(background);
	camera.position.set(0, 2.6, 7);
	sceneLights.directionalLight.position.set(4, 5, 4);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(lightMapScene.floorMesh);
	scene.add(lightMapScene.boxMesh);
}

function copyLightMapUvChannel(geometry: THREE.BufferGeometry): void {
	const uvAttribute = geometry.getAttribute('uv');

	if (!uvAttribute) {
		return;
	}

	// Light maps look at a second UV channel, so we copy the default one into it.
	geometry.setAttribute('uv1', uvAttribute.clone());
	geometry.setAttribute('uv2', uvAttribute.clone());
}

function createLightMapTexture(accentColor: string): THREE.CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;

	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Unable to create light map canvas.');
	}

	const gradient = context.createRadialGradient(160, 90, 16, 128, 128, 180);
	gradient.addColorStop(0, accentColor);
	gradient.addColorStop(0.4, '#f8fafc');
	gradient.addColorStop(1, '#111827');
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	const lightMapTexture = new THREE.CanvasTexture(canvas);
	lightMapTexture.colorSpace = THREE.SRGBColorSpace;
	return lightMapTexture;
}
