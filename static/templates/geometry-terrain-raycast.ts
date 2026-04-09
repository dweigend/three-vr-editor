/**
 * Purpose: Provide a terrain-and-raycast scene inspired by the official terrain raycast example.
 * Context: The template workbench uses this file to demonstrate pointer-aware terrain interaction without extra route code.
 * Responsibility: Build a deformed terrain surface, project a ray from pointer movement, and highlight the hit point.
 * Boundaries: This template keeps the interaction local and does not add external UI widgets or controls.
 */

/* @three-template
{
	"id": "geometry-terrain-raycast",
	"title": "Geometry Terrain Raycast",
	"description": "A heightfield terrain with a pointer-driven raycast marker.",
	"rendererKind": "webgl",
	"tags": ["terrain", "raycast", "interaction"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#082f49" },
		{ "key": "amplitude", "label": "Terrain amplitude", "control": "range", "min": 0.5, "max": 3.5, "step": 0.1, "defaultValue": 1.8 },
		{ "key": "resolution", "label": "Terrain resolution", "control": "range", "min": 24, "max": 72, "step": 4, "defaultValue": 40 },
		{ "key": "markerColor", "label": "Marker color", "control": "color", "defaultValue": "#22d3ee" }
	]
}
*/

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import {
	AmbientLight,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	PlaneGeometry,
	Raycaster,
	SphereGeometry,
	Vector2
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"amplitude": 1.8,
	"background": "#082f49",
	"markerColor": "#22d3ee",
	"resolution": 40
} satisfies Record<string, number | string>;
// @three-template-parameters:end

const terrainNoise = new ImprovedNoise();

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	scene
}): ThreeDemoSceneController => {
	const resolution = Number(templateParameters.resolution);
	const amplitude = Number(templateParameters.amplitude);
	const terrainGeometry = new PlaneGeometry(9, 9, resolution, resolution);
	const terrainMaterial = new MeshStandardMaterial({
		color: '#38bdf8',
		metalness: 0.05,
		roughness: 0.76
	});
	const terrain = new Mesh(terrainGeometry, terrainMaterial);
	const markerGeometry = new SphereGeometry(0.18, 20, 20);
	const markerMaterial = new MeshStandardMaterial({
		color: String(templateParameters.markerColor),
		emissive: String(templateParameters.markerColor),
		emissiveIntensity: 0.35
	});
	const marker = new Mesh(markerGeometry, markerMaterial);
	const ambientLight = new AmbientLight('#ffffff', 1.9);
	const directionalLight = new DirectionalLight('#ffffff', 3.2);
	const raycaster = new Raycaster();
	const pointer = new Vector2(0, 0);

	terrain.rotation.x = -Math.PI / 2;
	camera.position.set(0, 4.8, 5.2);
	camera.lookAt(0, 0, 0);
	directionalLight.position.set(3, 7, 4);
	scene.background = new Color(String(templateParameters.background));

	const position = terrainGeometry.attributes.position;

	for (let index = 0; index < position.count; index += 1) {
		const x = position.getX(index);
		const y = position.getY(index);
		const height = terrainNoise.noise(x * 0.3, y * 0.3, 0.24) * amplitude;
		position.setZ(index, height);
	}

	position.needsUpdate = true;
	terrainGeometry.computeVertexNormals();
	marker.visible = false;

	const handlePointerMove = (event: PointerEvent) => {
		const bounds = container.getBoundingClientRect();
		pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
	};

	container.addEventListener('pointermove', handlePointerMove);
	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(terrain);
	scene.add(marker);

	return {
		update: () => {
			raycaster.setFromCamera(pointer, camera);
			const hit = raycaster.intersectObject(terrain)[0];

			if (hit) {
				marker.visible = true;
				marker.position.copy(hit.point);
				marker.position.y += 0.2;
			}
		},
		dispose: () => {
			container.removeEventListener('pointermove', handlePointerMove);
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(terrain);
			scene.remove(marker);
			terrainGeometry.dispose();
			terrainMaterial.dispose();
			markerGeometry.dispose();
			markerMaterial.dispose();
		}
	};
};
