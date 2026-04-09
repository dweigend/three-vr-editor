/**
 * Purpose: Teach terrain deformation and raycasting with one visible hover marker.
 * Context: Students can move the pointer across the terrain and see how a raycast turns
 * screen input into a 3D hit position.
 * Responsibility: Build the terrain mesh, track pointer input, move the marker to the
 * hit point, and dispose every created resource.
 * Boundaries: This scene keeps the interaction local and does not add external UI.
 */

/* @three-template
{
	"id": "geometry-terrain-raycast",
	"title": "Geometry Terrain Raycast",
	"description": "A heightfield terrain with a pointer-driven raycast marker.",
	"rendererKind": "webgl",
	"tags": ["terrain", "raycast", "interaction"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#082f49"
		},
		{
			"key": "amplitude",
			"label": "Terrain amplitude",
			"control": "range",
			"min": 0.5,
			"max": 3.5,
			"step": 0.1,
			"defaultValue": 1.8
		},
		{
			"key": "resolution",
			"label": "Terrain resolution",
			"control": "range",
			"min": 24,
			"max": 72,
			"step": 4,
			"defaultValue": 40
		},
		{
			"key": "markerColor",
			"label": "Marker color",
			"control": "color",
			"defaultValue": "#22d3ee"
		}
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
} from '../../src/lib/three/three-demo-scene';
import { bindPointerTracking } from '../../src/lib/three/pointer-tracking';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"amplitude": 1.8,
	"background": "#082f49",
	"markerColor": "#22d3ee",
	"resolution": 40
} satisfies Record<string, number | string>;
// @three-template-parameters:end

const terrainNoise = new ImprovedNoise();

type TerrainSceneSettings = {
	amplitude: number;
	background: string;
	markerColor: string;
	resolution: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	scene
}): ThreeDemoSceneController => {
	const settings = readTerrainSceneSettings();
	const terrainGeometry = new PlaneGeometry(
		9,
		9,
		settings.resolution,
		settings.resolution
	);
	const terrainMaterial = createTerrainMaterial();
	const terrainMesh = new Mesh(terrainGeometry, terrainMaterial);
	const markerGeometry = new SphereGeometry(0.18, 20, 20);
	const markerMaterial = createMarkerMaterial(settings.markerColor);
	const terrainMarker = new Mesh(markerGeometry, markerMaterial);
	const sceneLights = createSceneLights();
	const pointerTracker = bindPointerTracking(container);
	const raycaster = new Raycaster();

	applyTerrainHeights(terrainGeometry, settings.amplitude);
	configureScene(
		camera,
		scene,
		settings.background,
		terrainMesh,
		terrainMarker,
		sceneLights
	);

	return {
		update: () => {
			updateMarkerPosition(
				raycaster,
				pointerTracker.pointer,
				camera,
				terrainMesh,
				terrainMarker
			);
		},
		dispose: () => {
			pointerTracker.dispose();
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(terrainMesh);
			scene.remove(terrainMarker);
			terrainGeometry.dispose();
			terrainMaterial.dispose();
			markerGeometry.dispose();
			markerMaterial.dispose();
		}
	};
};

function readTerrainSceneSettings(): TerrainSceneSettings {
	return {
		amplitude: Number(templateParameters.amplitude),
		background: String(templateParameters.background),
		markerColor: String(templateParameters.markerColor),
		resolution: Number(templateParameters.resolution)
	};
}

function createTerrainMaterial(): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: '#38bdf8',
		metalness: 0.05,
		roughness: 0.76
	});
}

function createMarkerMaterial(markerColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: markerColor,
		emissive: markerColor,
		emissiveIntensity: 0.35
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 1.9),
		directionalLight: new DirectionalLight('#ffffff', 3.2)
	};
}

function applyTerrainHeights(
	terrainGeometry: PlaneGeometry,
	amplitude: number
): void {
	const positionAttribute = terrainGeometry.attributes.position;

	for (let index = 0; index < positionAttribute.count; index += 1) {
		const xPosition = positionAttribute.getX(index);
		const yPosition = positionAttribute.getY(index);
		const terrainHeight =
			terrainNoise.noise(xPosition * 0.3, yPosition * 0.3, 0.24) * amplitude;

		positionAttribute.setZ(index, terrainHeight);
	}

	positionAttribute.needsUpdate = true;
	terrainGeometry.computeVertexNormals();
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	terrainMesh: Mesh,
	terrainMarker: Mesh,
	sceneLights: SceneLights
): void {
	terrainMesh.rotation.x = -Math.PI / 2;
	terrainMarker.visible = false;
	scene.background = new Color(background);
	camera.position.set(0, 4.8, 5.2);
	camera.lookAt(0, 0, 0);
	sceneLights.directionalLight.position.set(3, 7, 4);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(terrainMesh);
	scene.add(terrainMarker);
}

function updateMarkerPosition(
	raycaster: Raycaster,
	pointer: Vector2,
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	terrainMesh: Mesh,
	terrainMarker: Mesh
): void {
	raycaster.setFromCamera(pointer, camera);
	const hit = raycaster.intersectObject(terrainMesh)[0];

	if (!hit) {
		terrainMarker.visible = false;
		return;
	}

	terrainMarker.visible = true;
	terrainMarker.position.copy(hit.point);
	terrainMarker.position.y += 0.2;
}
