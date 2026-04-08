/**
 * Purpose: Provide a compact batched-mesh scene inspired by the official batch mesh example.
 * Context: The template workbench uses this file to demonstrate a WebGPU-oriented high-instance scene with one managed source file.
 * Responsibility: Allocate one BatchedMesh, fill it with a few geometry types, animate a subset of instances, and clean up resources.
 * Boundaries: This simplified variant omits inspector tooling and the larger interactive example shell.
 */

/* @three-template
{
	"id": "mesh-batch",
	"title": "Mesh Batch",
	"description": "A compact batched-mesh field with animated instances on the WebGPU path.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "batch", "instances"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#020617" },
		{ "key": "instanceCount", "label": "Instance count", "control": "range", "min": 24, "max": 220, "step": 4, "defaultValue": 96 },
		{ "key": "radius", "label": "Field radius", "control": "range", "min": 6, "max": 20, "step": 1, "defaultValue": 12 },
		{ "key": "opacity", "label": "Opacity", "control": "range", "min": 0.2, "max": 1, "step": 0.05, "defaultValue": 0.85 }
	]
}
*/

import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"instanceCount": 96,
	"opacity": 0.85,
	"radius": 12
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const instanceCount = Number(templateParameters.instanceCount);
	const radius = Number(templateParameters.radius);
	const geometries = [
		new THREE.BoxGeometry(1.2, 1.2, 1.2),
		new THREE.ConeGeometry(0.8, 1.6, 24),
		new THREE.SphereGeometry(0.7, 24, 18)
	];
	const material = new THREE.MeshStandardMaterial({
		metalness: 0.18,
		opacity: Number(templateParameters.opacity),
		roughness: 0.34,
		transparent: Number(templateParameters.opacity) < 1
	});
	const mesh = new THREE.BatchedMesh(instanceCount, instanceCount * 320, instanceCount * 640, material);
	const geometryIds = geometries.map((geometry) => mesh.addGeometry(geometry));
	const dummy = new THREE.Object3D();
	const seeds: number[] = [];
	const instanceIds: number[] = [];
	const ambientLight = new THREE.AmbientLight('#ffffff', 1.4);
	const directionalLight = new THREE.DirectionalLight('#ffffff', 2.8);
	let time = 0;

	scene.background = new THREE.Color(String(templateParameters.background));
	camera.position.set(0, 0, radius * 2.2);
	directionalLight.position.set(radius * 0.8, radius, radius * 0.6);

	for (let index = 0; index < instanceCount; index += 1) {
		const id = mesh.addInstance(geometryIds[index % geometryIds.length]);
		const angle = (index / instanceCount) * Math.PI * 2;
		const distance = radius * (0.35 + (index % 5) * 0.1);

		dummy.position.set(
			Math.cos(angle) * distance,
			Math.sin(angle * 1.7) * 2.4,
			Math.sin(angle) * distance
		);
		dummy.rotation.set(angle, angle * 0.4, angle * 0.8);
		dummy.scale.setScalar(0.6 + (index % 4) * 0.16);
		dummy.updateMatrix();

		mesh.setMatrixAt(id, dummy.matrix);
		mesh.setColorAt(id, new THREE.Color().setHSL((index % 12) / 12, 0.72, 0.58));
		instanceIds.push(id);
		seeds.push(Math.random() * Math.PI * 2);
	}

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(mesh);

	return {
		update: () => {
			time += 0.016;

			for (let index = 0; index < instanceIds.length; index += 1) {
				const angle = (index / instanceCount) * Math.PI * 2;
				const distance = radius * (0.35 + (index % 5) * 0.1);
				const bob = Math.sin(time * 1.4 + seeds[index]) * 0.8;

				dummy.position.set(
					Math.cos(angle + time * 0.12) * distance,
					Math.sin(angle * 1.7 + time * 0.8) * 2.4 + bob,
					Math.sin(angle + time * 0.12) * distance
				);
				dummy.rotation.set(time * 0.6 + seeds[index], angle + time * 0.4, seeds[index] * 0.4);
				dummy.scale.setScalar(0.6 + (index % 4) * 0.16);
				dummy.updateMatrix();
				mesh.setMatrixAt(instanceIds[index], dummy.matrix);
			}
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(mesh);
			geometries.forEach((geometry) => geometry.dispose());
			mesh.dispose?.();
			material.dispose();
		}
	};
};
