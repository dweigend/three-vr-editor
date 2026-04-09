/**
 * Purpose: Teach a blocky terrain made from many simple cube instances.
 * Context: Students can change the grid size and terrain height to see how instancing
 * and procedural noise work together.
 * Responsibility: Build the instanced terrain, light it, animate it slightly, and
 * release all shared resources.
 * Boundaries: This scene stays focused on terrain generation and omits controls
 * or textures.
 */

/* @three-template
{
	"id": "geometry-minecraft",
	"title": "Geometry Minecraft",
	"description": "A compact voxel terrain scene with a Minecraft-like silhouette.",
	"rendererKind": "webgl",
	"tags": ["geometry", "minecraft", "terrain"],
	"parameters": [
		{
			"key": "background",
			"label": "Sky color",
			"control": "color",
			"defaultValue": "#bfdbfe"
		},
		{
			"key": "gridSize",
			"label": "Grid size",
			"control": "range",
			"min": 8,
			"max": 18,
			"step": 1,
			"defaultValue": 12
		},
		{
			"key": "heightScale",
			"label": "Height scale",
			"control": "range",
			"min": 1,
			"max": 6,
			"step": 0.5,
			"defaultValue": 3
		},
		{
			"key": "groundColor",
			"label": "Ground color",
			"control": "color",
			"defaultValue": "#65a30d"
		}
	]
}
*/

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	InstancedMesh,
	MeshStandardMaterial,
	Object3D
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#bfdbfe",
	"gridSize": 12,
	"groundColor": "#65a30d",
	"heightScale": 3
} satisfies Record<string, number | string>;
// @three-template-parameters:end

const terrainNoise = new ImprovedNoise();

type MinecraftSceneSettings = {
	background: string;
	gridSize: number;
	groundColor: string;
	heightScale: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readMinecraftSceneSettings();
	const blockGeometry = new BoxGeometry(1, 1, 1);
	const groundMaterial = createGroundMaterial(settings.groundColor);
	const blockCount = settings.gridSize * settings.gridSize;
	const terrainMesh = new InstancedMesh(blockGeometry, groundMaterial, blockCount);
	const placementHelper = new Object3D();
	const sceneLights = createSceneLights();

	fillTerrain(terrainMesh, placementHelper, settings);
	configureScene(camera, scene, settings, terrainMesh, sceneLights);

	return {
		update: () => {
			terrainMesh.rotation.y += 0.0025;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(terrainMesh);
			blockGeometry.dispose();
			groundMaterial.dispose();
		}
	};
};

function readMinecraftSceneSettings(): MinecraftSceneSettings {
	return {
		background: String(templateParameters.background),
		gridSize: Number(templateParameters.gridSize),
		groundColor: String(templateParameters.groundColor),
		heightScale: Number(templateParameters.heightScale)
	};
}

function createGroundMaterial(groundColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: groundColor,
		metalness: 0.04,
		roughness: 0.88
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 2.2),
		directionalLight: new DirectionalLight('#ffffff', 3.4)
	};
}

function fillTerrain(
	terrainMesh: InstancedMesh,
	placementHelper: Object3D,
	settings: MinecraftSceneSettings
): void {
	let instanceIndex = 0;

	for (let zIndex = 0; zIndex < settings.gridSize; zIndex += 1) {
		for (let xIndex = 0; xIndex < settings.gridSize; xIndex += 1) {
			const terrainHeight = readTerrainHeight(xIndex, zIndex, settings.heightScale);
			const xOffset = xIndex - settings.gridSize / 2;
			const zOffset = zIndex - settings.gridSize / 2;

			placementHelper.position.set(xOffset, terrainHeight * 0.5, zOffset);
			placementHelper.scale.set(0.92, terrainHeight, 0.92);
			placementHelper.updateMatrix();
			terrainMesh.setMatrixAt(instanceIndex, placementHelper.matrix);
			instanceIndex += 1;
		}
	}
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	settings: MinecraftSceneSettings,
	terrainMesh: InstancedMesh,
	sceneLights: SceneLights
): void {
	scene.background = new Color(settings.background);
	camera.position.set(
		settings.gridSize * 0.6,
		settings.gridSize * 0.7,
		settings.gridSize * 0.8
	);
	camera.lookAt(0, 0, 0);
	sceneLights.directionalLight.position.set(
		settings.gridSize,
		settings.gridSize * 1.4,
		settings.gridSize * 0.8
	);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(terrainMesh);
}

function readTerrainHeight(
	xIndex: number,
	zIndex: number,
	heightScale: number
): number {
	const noiseValue = terrainNoise.noise(xIndex * 0.18, zIndex * 0.18, 0.35);
	return Math.max(1, Math.round((noiseValue + 0.6) * heightScale));
}
