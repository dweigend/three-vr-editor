/**
 * Purpose: Provide a dynamic instancing scene inspired by the official instancing dynamic example.
 * Context: The template workbench uses this file to demonstrate high-count animated objects inside one managed scene file.
 * Responsibility: Build an instanced grid of boxes, animate their heights, and dispose shared resources.
 * Boundaries: This scene intentionally omits the original example UI, tweening helpers, and environment assets.
 */

/* @three-template
{
	"id": "instancing-dynamic",
	"title": "Instancing Dynamic",
	"description": "A wave of instanced columns that animate their height over time.",
	"rendererKind": "webgl",
	"tags": ["instancing", "animation", "performance"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#0f172a" },
		{ "key": "amount", "label": "Grid amount", "control": "range", "min": 8, "max": 22, "step": 1, "defaultValue": 14 },
		{ "key": "waveSpeed", "label": "Wave speed", "control": "range", "min": 0.4, "max": 3, "step": 0.1, "defaultValue": 1.4 },
		{ "key": "columnColor", "label": "Column color", "control": "color", "defaultValue": "#22d3ee" }
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
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"amount": 14,
	"background": "#0f172a",
	"columnColor": "#22d3ee",
	"waveSpeed": 1.4
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const amount = Number(templateParameters.amount);
	const count = amount * amount;
	const geometry = new BoxGeometry(0.8, 1, 0.8);
	const material = new MeshStandardMaterial({
		color: String(templateParameters.columnColor),
		metalness: 0.18,
		roughness: 0.45
	});
	const mesh = new InstancedMesh(geometry, material, count);
	const ambientLight = new AmbientLight('#ffffff', 1.8);
	const directionalLight = new DirectionalLight('#ffffff', 3.2);
	const dummy = new Object3D();
	const seeds: number[] = [];
	let time = 0;
	let instanceId = 0;

	scene.background = new Color(String(templateParameters.background));
	camera.position.set(amount * 0.45, amount * 0.42, amount * 0.55);
	camera.lookAt(0, 0, 0);
	directionalLight.position.set(amount * 0.4, amount * 0.7, amount * 0.4);

	for (let z = 0; z < amount; z += 1) {
		for (let x = 0; x < amount; x += 1) {
			dummy.position.set(x - amount / 2, 0.5, z - amount / 2);
			dummy.updateMatrix();
			mesh.setMatrixAt(instanceId, dummy.matrix);
			seeds.push(Math.random() * Math.PI * 2);
			instanceId += 1;
		}
	}

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(mesh);

	return {
		update: () => {
			time += 0.016 * Number(templateParameters.waveSpeed);

			for (let index = 0; index < count; index += 1) {
				const x = index % amount;
				const z = Math.floor(index / amount);
				const height = 0.6 + Math.abs(Math.sin(time + seeds[index] + x * 0.35 + z * 0.2)) * 3.4;

				dummy.position.set(x - amount / 2, height * 0.5, z - amount / 2);
				dummy.scale.set(1, height, 1);
				dummy.updateMatrix();
				mesh.setMatrixAt(index, dummy.matrix);
			}

			mesh.instanceMatrix.needsUpdate = true;
			mesh.rotation.y += 0.0025;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		}
	};
};
