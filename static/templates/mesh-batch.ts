import * as THREE from 'three/webgpu';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';
export const templateUi = defineThreeTemplateUi({
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
});
export const templateParameters = defineThreeTemplateParameters({
	"background": "#020617",
	"instanceCount": 96,
	"opacity": 0.85,
	"radius": 12
});

export const demoRendererKind = 'webgpu';

type BatchedSettings = {
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

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readBatchedSettings();
	const batchedScene = createBatchedScene(settings);
	const sceneLights = createSceneLights();
	let elapsedTime = 0;

	setupScene(
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

function readBatchedSettings(): BatchedSettings {
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

function createBatchedScene(settings: BatchedSettings): BatchedScene {
	const material = createBatchedMaterial(settings.opacity);
	const geometryDefinitions = createGeometryDefinitions();
	const batchedMesh = createBatchedMesh(settings.instanceCount, material);
	const geometryIds = geometryDefinitions.map((geometry) =>
		batchedMesh.addGeometry(geometry)
	);
	const instanceIds = addBatchedInstances(
		batchedMesh,
		geometryIds,
		settings.instanceCount
	);

	return {
		batchedMesh,
		geometryDefinitions,
		instanceIds,
		material,
		placementHelper: new THREE.Object3D()
	};
}

function createBatchedMaterial(opacity: number): THREE.MeshStandardMaterial {
	return new THREE.MeshStandardMaterial({
		metalness: 0.18,
		opacity,
		roughness: 0.34,
		transparent: opacity < 1
	});
}

function createGeometryDefinitions(): THREE.BufferGeometry[] {
	return [
		new THREE.BoxGeometry(1.2, 1.2, 1.2),
		new THREE.ConeGeometry(0.8, 1.6, 24),
		new THREE.SphereGeometry(0.7, 24, 18)
	];
}

function createBatchedMesh(
	instanceCount: number,
	material: THREE.MeshStandardMaterial
): THREE.BatchedMesh {
	return new THREE.BatchedMesh(
		instanceCount,
		instanceCount * 320,
		instanceCount * 640,
		material
	);
}

function addBatchedInstances(
	batchedMesh: THREE.BatchedMesh,
	geometryIds: number[],
	instanceCount: number
): number[] {
	const instanceIds: number[] = [];

	for (let index = 0; index < instanceCount; index += 1) {
		// BatchedMesh keeps many transforms inside one shared draw-friendly object.
		const instanceId = batchedMesh.addInstance(
			geometryIds[index % geometryIds.length]
		);
		batchedMesh.setColorAt(
			instanceId,
			new THREE.Color().setHSL((index % 12) / 12, 0.72, 0.58)
		);
		instanceIds.push(instanceId);
	}

	return instanceIds;
}

function setupScene(
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
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
	settings: BatchedSettings,
	elapsedTime: number
): void {
	for (let index = 0; index < batchedScene.instanceIds.length; index += 1) {
		updateInstanceTransform(
			batchedScene.placementHelper,
			settings,
			index,
			elapsedTime
		);
		batchedScene.batchedMesh.setMatrixAt(
			batchedScene.instanceIds[index],
			batchedScene.placementHelper.matrix
		);
	}
}

function updateInstanceTransform(
	placementHelper: THREE.Object3D,
	settings: BatchedSettings,
	index: number,
	elapsedTime: number
): void {
	const angle = (index / settings.instanceCount) * Math.PI * 2;
	const ringIndex = index % 5;
	const orbitRadius = settings.radius * (0.35 + ringIndex * 0.1);
	const phaseOffset = (index % 11) * 0.4;
	const bobHeight = Math.sin(elapsedTime * 1.3 + phaseOffset) * 0.8;

	placementHelper.position.set(
		Math.cos(angle + elapsedTime * 0.12) * orbitRadius,
		Math.sin(angle * 1.7 + elapsedTime * 0.8) * 2.4 + bobHeight,
		Math.sin(angle + elapsedTime * 0.12) * orbitRadius
	);
	placementHelper.rotation.set(
		elapsedTime * 0.6 + phaseOffset,
		angle + elapsedTime * 0.4,
		phaseOffset * 0.4
	);
	placementHelper.scale.setScalar(0.6 + (index % 4) * 0.16);
	placementHelper.updateMatrix();
}
