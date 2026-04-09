/**
 * Purpose: Teach how instancing can animate many objects with one shared mesh setup.
 * Context: Students can change the grid size and wave speed to see how one update loop
 * controls a large field of animated columns.
 * Responsibility: Build the instanced column field, animate each column height, and
 * clean up the shared geometry and material.
 * Boundaries: This template focuses on instancing and skips the larger original demo UI.
 */

/* @three-template
{
	"id": "instancing-dynamic",
	"title": "Instancing Dynamic",
	"description": "A wave of instanced columns that animate their height over time.",
	"rendererKind": "webgl",
	"tags": ["instancing", "animation", "performance"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#0f172a"
		},
		{
			"key": "amount",
			"label": "Grid amount",
			"control": "range",
			"min": 8,
			"max": 22,
			"step": 1,
			"defaultValue": 14
		},
		{
			"key": "waveSpeed",
			"label": "Wave speed",
			"control": "range",
			"min": 0.4,
			"max": 3,
			"step": 0.1,
			"defaultValue": 1.4
		},
		{
			"key": "columnColor",
			"label": "Column color",
			"control": "color",
			"defaultValue": "#22d3ee"
		}
	]
}
*/

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
	"amount": 14,
	"background": "#0f172a",
	"columnColor": "#22d3ee",
	"waveSpeed": 1.4
} satisfies Record<string, number | string>;
// @three-template-parameters:end

type InstancingSceneSettings = {
	amount: number;
	background: string;
	columnColor: string;
	waveSpeed: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readInstancingSceneSettings();
	const columnGeometry = new BoxGeometry(0.8, 1, 0.8);
	const columnMaterial = createColumnMaterial(settings.columnColor);
	const instanceCount = settings.amount * settings.amount;
	const columnField = new InstancedMesh(
		columnGeometry,
		columnMaterial,
		instanceCount
	);
	const placementHelper = new Object3D();
	const sceneLights = createSceneLights();
	let elapsedTime = 0;

	populateColumns(columnField, placementHelper, settings.amount, 0);
	configureScene(
		camera,
		scene,
		settings.background,
		settings.amount,
		columnField,
		sceneLights
	);

	return {
		update: () => {
			elapsedTime += 0.016 * settings.waveSpeed;
			populateColumns(columnField, placementHelper, settings.amount, elapsedTime);
			columnField.instanceMatrix.needsUpdate = true;
			columnField.rotation.y += 0.0025;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(columnField);
			columnGeometry.dispose();
			columnMaterial.dispose();
		}
	};
};

function readInstancingSceneSettings(): InstancingSceneSettings {
	return {
		amount: Number(templateParameters.amount),
		background: String(templateParameters.background),
		columnColor: String(templateParameters.columnColor),
		waveSpeed: Number(templateParameters.waveSpeed)
	};
}

function createColumnMaterial(columnColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: columnColor,
		metalness: 0.18,
		roughness: 0.45
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 1.8),
		directionalLight: new DirectionalLight('#ffffff', 3.2)
	};
}

function populateColumns(
	columnField: InstancedMesh,
	placementHelper: Object3D,
	amount: number,
	elapsedTime: number
): void {
	let instanceIndex = 0;

	for (let zIndex = 0; zIndex < amount; zIndex += 1) {
		for (let xIndex = 0; xIndex < amount; xIndex += 1) {
			const wavePhase = xIndex * 0.35 + zIndex * 0.2;
			const columnHeight =
				0.6 + Math.abs(Math.sin(elapsedTime + wavePhase)) * 3.4;

			placementHelper.position.set(
				xIndex - amount / 2,
				columnHeight * 0.5,
				zIndex - amount / 2
			);
			placementHelper.scale.set(1, columnHeight, 1);
			placementHelper.updateMatrix();
			columnField.setMatrixAt(instanceIndex, placementHelper.matrix);
			instanceIndex += 1;
		}
	}
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	amount: number,
	columnField: InstancedMesh,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	camera.position.set(amount * 0.45, amount * 0.42, amount * 0.55);
	camera.lookAt(0, 0, 0);
	sceneLights.directionalLight.position.set(
		amount * 0.4,
		amount * 0.7,
		amount * 0.4
	);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(columnField);
}
