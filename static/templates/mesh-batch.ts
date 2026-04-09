/**
 * Purpose: Teach how batched meshes draw many related objects through one shared
 * container.
 * Context: Students can change the instance count and field radius while keeping the code
 * focused on one batched mesh instead of many separate meshes.
 * Responsibility: Build the batched field, animate the instance transforms, and dispose
 * the shared geometries and material.
 * Boundaries: This template keeps only the core batching idea and omits inspector
 * tooling.
 */

/* @three-template
{
	"id": "mesh-batch",
	"title": "Mesh Batch",
	"description": "A compact batched-mesh field with animated instances.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "batch", "instances"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#020617"
		},
		{
			"key": "instanceCount",
			"label": "Instance count",
			"control": "range",
			"min": 24,
			"max": 220,
			"step": 4,
			"defaultValue": 96
		},
		{
			"key": "radius",
			"label": "Field radius",
			"control": "range",
			"min": 6,
			"max": 20,
			"step": 1,
			"defaultValue": 12
		},
		{
			"key": "opacity",
			"label": "Opacity",
			"control": "range",
			"min": 0.2,
			"max": 1,
			"step": 0.05,
			"defaultValue": 0.85
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
	"background": "#020617",
	"instanceCount": 96,
	"opacity": 0.85,
	"radius": 12
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

type BatchedSceneSettings = {
	background: string;
	instanceCount: number;
	opacity: number;
	radius: number;
};

type SceneLights = {
	ambientLight: THREE.AmbientLight;
	directionalLight: THREE.DirectionalLight;
};

type BatchedScene = {
	batchedMesh: THREE.BatchedMesh;
	geometryDefinitions: THREE.BufferGeometry[];
	instanceIds: number[];
	material: THREE.MeshStandardMaterial;
	placementHelper: THREE.Object3D;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readBatchedSceneSettings();
	const batchedScene = createBatchedScene(settings);
	const sceneLights = createSceneLights();
	let elapsedTime = 0;

	configureScene(
		camera,
		scene,
		settings.background,
		settings.radius,
		batchedScene,
		sceneLights
	);
	updateBatchTransforms(batchedScene, settings, 0);

	return {
		update: () => {
			elapsedTime += 0.016;
			updateBatchTransforms(batchedScene, settings, elapsedTime);
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(batchedScene.batchedMesh);
			batchedScene.geometryDefinitions.forEach((geometry) => geometry.dispose());
			batchedScene.material.dispose();
			batchedScene.batchedMesh.dispose?.();
		}
	};
};

function readBatchedSceneSettings(): BatchedSceneSettings {
	return {
		background: String(templateParameters.background),
		instanceCount: Number(templateParameters.instanceCount),
		opacity: Number(templateParameters.opacity),
		radius: Number(templateParameters.radius)
	};
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new THREE.AmbientLight('#ffffff', 1.4),
		directionalLight: new THREE.DirectionalLight('#ffffff', 2.8)
	};
}

function createBatchedScene(settings: BatchedSceneSettings): BatchedScene {
	const material = new THREE.MeshStandardMaterial({
		metalness: 0.18,
		opacity: settings.opacity,
		roughness: 0.34,
		transparent: settings.opacity < 1
	});
	const geometryDefinitions = [
		new THREE.BoxGeometry(1.2, 1.2, 1.2),
		new THREE.ConeGeometry(0.8, 1.6, 24),
		new THREE.SphereGeometry(0.7, 24, 18)
	];
	const batchedMesh = new THREE.BatchedMesh(
		settings.instanceCount,
		settings.instanceCount * 320,
		settings.instanceCount * 640,
		material
	);
	const geometryIds = geometryDefinitions.map((geometry) =>
		batchedMesh.addGeometry(geometry)
	);
	const instanceIds: number[] = [];

	for (let index = 0; index < settings.instanceCount; index += 1) {
		const instanceId = batchedMesh.addInstance(
			geometryIds[index % geometryIds.length]
		);
		batchedMesh.setColorAt(
			instanceId,
			new THREE.Color().setHSL((index % 12) / 12, 0.72, 0.58)
		);
		instanceIds.push(instanceId);
	}

	return {
		batchedMesh,
		geometryDefinitions,
		instanceIds,
		material,
		placementHelper: new THREE.Object3D()
	};
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	radius: number,
	batchedScene: BatchedScene,
	sceneLights: SceneLights
): void {
	scene.background = new THREE.Color(background);
	camera.position.set(0, 0, radius * 2.2);
	sceneLights.directionalLight.position.set(radius * 0.8, radius, radius * 0.6);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(batchedScene.batchedMesh);
}

function updateBatchTransforms(
	batchedScene: BatchedScene,
	settings: BatchedSceneSettings,
	elapsedTime: number
): void {
	for (let index = 0; index < batchedScene.instanceIds.length; index += 1) {
		const angle = (index / settings.instanceCount) * Math.PI * 2;
		const ringIndex = index % 5;
		const orbitRadius = settings.radius * (0.35 + ringIndex * 0.1);
		const phaseOffset = (index % 11) * 0.4;
		const bobHeight = Math.sin(elapsedTime * 1.3 + phaseOffset) * 0.8;

		batchedScene.placementHelper.position.set(
			Math.cos(angle + elapsedTime * 0.12) * orbitRadius,
			Math.sin(angle * 1.7 + elapsedTime * 0.8) * 2.4 + bobHeight,
			Math.sin(angle + elapsedTime * 0.12) * orbitRadius
		);
		batchedScene.placementHelper.rotation.set(
			elapsedTime * 0.6 + phaseOffset,
			angle + elapsedTime * 0.4,
			phaseOffset * 0.4
		);
		batchedScene.placementHelper.scale.setScalar(0.6 + (index % 4) * 0.16);
		batchedScene.placementHelper.updateMatrix();
		batchedScene.batchedMesh.setMatrixAt(
			batchedScene.instanceIds[index],
			batchedScene.placementHelper.matrix
		);
	}
}
