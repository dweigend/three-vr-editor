/**
 * Purpose: Teach a baked-looking material using a tiny procedural light map.
 * Context: Students can change the base color, accent color, and light-map intensity
 * without needing any external texture files.
 * Responsibility: Build the scene, generate the light map, copy the UV channel needed for
 * light maps, and clean up every created resource.
 * Boundaries: This template focuses on the light-map idea and avoids the larger
 * original demo.
 */

/* @three-template
{
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
}
*/

import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"accentColor": "#60a5fa",
	"background": "#111827",
	"baseColor": "#e5e7eb",
	"lightMapIntensity": 1.4
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

type LightMapSceneSettings = {
	accentColor: string;
	background: string;
	baseColor: string;
	lightMapIntensity: number;
};

type SceneLights = {
	ambientLight: THREE.AmbientLight;
	directionalLight: THREE.DirectionalLight;
};

type LightMapScene = {
	boxGeometry: THREE.BoxGeometry;
	boxMaterial: THREE.MeshStandardMaterial;
	boxMesh: THREE.Mesh;
	floorGeometry: THREE.PlaneGeometry;
	floorMaterial: THREE.MeshStandardMaterial;
	floorMesh: THREE.Mesh;
	lightMapTexture: THREE.CanvasTexture;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readLightMapSceneSettings();
	const lightMapScene = createLightMapScene(settings);
	const sceneLights = createSceneLights();

	configureScene(camera, scene, settings.background, lightMapScene, sceneLights);

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
			lightMapScene.floorGeometry.dispose();
			lightMapScene.boxGeometry.dispose();
			lightMapScene.floorMaterial.dispose();
			lightMapScene.boxMaterial.dispose();
		}
	};
};

function readLightMapSceneSettings(): LightMapSceneSettings {
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

function createLightMapScene(settings: LightMapSceneSettings): LightMapScene {
	const lightMapTexture = createLightMapTexture(settings.accentColor);
	const floorGeometry = new THREE.PlaneGeometry(8, 8);
	const boxGeometry = new THREE.BoxGeometry(2, 2.6, 2);
	const boxMaterial = new THREE.MeshStandardMaterial({
		color: settings.baseColor,
		lightMap: lightMapTexture,
		lightMapIntensity: settings.lightMapIntensity,
		metalness: 0.02,
		roughness: 0.86
	});
	const floorMaterial = new THREE.MeshStandardMaterial({
		color: '#1f2937',
		metalness: 0,
		roughness: 0.92
	});
	const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

	copyLightMapUvChannel(boxGeometry);
	floorMesh.rotation.x = -Math.PI / 2;
	floorMesh.position.y = -1.3;

	return {
		boxGeometry,
		boxMaterial,
		boxMesh,
		floorGeometry,
		floorMaterial,
		floorMesh,
		lightMapTexture
	};
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
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

	// Light maps use a second UV channel, so we copy the default UVs into that slot.
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
