/**
 * Purpose: Provide a simplified voxel-terrain scene inspired by the official geometry minecraft example.
 * Context: The template workbench uses this file to demonstrate procedural terrain generation with optional parameters.
 * Responsibility: Build one blocky terrain mesh from instanced cubes, light it, and dispose shared resources.
 * Boundaries: This scene omits texture packs, first-person controls, and other full-demo concerns.
 */

/* @three-template
{
	"id": "geometry-minecraft",
	"title": "Geometry Minecraft",
	"description": "A compact voxel terrain scene with a Minecraft-like silhouette.",
	"rendererKind": "webgl",
	"tags": ["geometry", "minecraft", "terrain"],
	"parameters": [
		{ "key": "background", "label": "Sky color", "control": "color", "defaultValue": "#bfdbfe" },
		{ "key": "gridSize", "label": "Grid size", "control": "range", "min": 8, "max": 18, "step": 1, "defaultValue": 12 },
		{ "key": "heightScale", "label": "Height scale", "control": "range", "min": 1, "max": 6, "step": 0.5, "defaultValue": 3 },
		{ "key": "groundColor", "label": "Ground color", "control": "color", "defaultValue": "#65a30d" }
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
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#bfdbfe",
	"gridSize": 12,
	"groundColor": "#65a30d",
	"heightScale": 3
} satisfies Record<string, number | string>;
// @three-template-parameters:end

const noise = new ImprovedNoise();

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const gridSize = Number(templateParameters.gridSize);
	const heightScale = Number(templateParameters.heightScale);
	const blockGeometry = new BoxGeometry(1, 1, 1);
	const material = new MeshStandardMaterial({
		color: String(templateParameters.groundColor),
		metalness: 0.04,
		roughness: 0.88
	});
	const blockCount = gridSize * gridSize;
	const blocks = new InstancedMesh(blockGeometry, material, blockCount);
	const ambientLight = new AmbientLight('#ffffff', 2.2);
	const directionalLight = new DirectionalLight('#ffffff', 3.4);
	const dummy = new Object3D();
	let instanceId = 0;

	scene.background = new Color(String(templateParameters.background));
	camera.position.set(gridSize * 0.6, gridSize * 0.7, gridSize * 0.8);
	camera.lookAt(0, 0, 0);
	directionalLight.position.set(gridSize, gridSize * 1.4, gridSize * 0.8);

	for (let z = 0; z < gridSize; z += 1) {
		for (let x = 0; x < gridSize; x += 1) {
			const xOffset = x - gridSize / 2;
			const zOffset = z - gridSize / 2;
			const height =
				Math.max(1, Math.round((noise.noise(x * 0.18, z * 0.18, 0.35) + 0.6) * heightScale));

			dummy.position.set(xOffset, height * 0.5, zOffset);
			dummy.scale.set(0.92, height, 0.92);
			dummy.updateMatrix();
			blocks.setMatrixAt(instanceId, dummy.matrix);
			instanceId += 1;
		}
	}

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(blocks);

	return {
		update: () => {
			blocks.rotation.y += 0.0025;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(blocks);
			blockGeometry.dispose();
			material.dispose();
		}
	};
};
