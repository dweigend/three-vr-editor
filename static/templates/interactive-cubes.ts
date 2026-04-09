/**
 * Purpose: Teach basic raycasting with a small field of cubes.
 * Context: Students can move the pointer over the scene and see how one hovered cube
 * swaps to a brighter material.
 * Responsibility: Build the cube field, track pointer input, highlight the hovered cube,
 * and clean up all event listeners and resources.
 * Boundaries: This template stays focused on one hover interaction and omits extra UI.
 */

/* @three-template
{
	"id": "interactive-cubes",
	"title": "Interactive Cubes",
	"description": "A small cube field that highlights the hovered cube.",
	"rendererKind": "webgl",
	"tags": ["interaction", "raycast", "cubes"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#111827"
		},
		{
			"key": "cubeColor",
			"label": "Cube color",
			"control": "color",
			"defaultValue": "#60a5fa"
		},
		{
			"key": "highlightColor",
			"label": "Highlight color",
			"control": "color",
			"defaultValue": "#fbbf24"
		},
		{
			"key": "gridSize",
			"label": "Grid size",
			"control": "range",
			"min": 3,
			"max": 8,
			"step": 1,
			"defaultValue": 5
		}
	]
}
*/

import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Group,
	Mesh,
	MeshStandardMaterial,
	Raycaster,
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
	"background": "#111827",
	"cubeColor": "#60a5fa",
	"gridSize": 5,
	"highlightColor": "#fbbf24"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

type InteractiveCubeSettings = {
	background: string;
	cubeColor: string;
	gridSize: number;
	highlightColor: string;
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
	const settings = readInteractiveCubeSettings();
	const cubeGeometry = new BoxGeometry(0.72, 0.72, 0.72);
	const baseMaterial = createBaseMaterial(settings.cubeColor);
	const highlightMaterial = createHighlightMaterial(settings.highlightColor);
	const cubeGroup = new Group();
	const cubeMeshes = createCubeField(
		cubeGroup,
		cubeGeometry,
		baseMaterial,
		settings.gridSize
	);
	const sceneLights = createSceneLights();
	const pointerTracker = bindPointerTracking(container);
	const raycaster = new Raycaster();
	let hoveredCube: Mesh | null = null;

	configureScene(camera, scene, settings.background, cubeGroup, sceneLights);

	return {
		update: () => {
			cubeGroup.rotation.y += 0.003;
			hoveredCube = updateHoveredCube(
				raycaster,
				pointerTracker.pointer,
				camera,
				cubeMeshes,
				baseMaterial,
				highlightMaterial,
				hoveredCube
			);
		},
		dispose: () => {
			pointerTracker.dispose();
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(cubeGroup);
			cubeGeometry.dispose();
			baseMaterial.dispose();
			highlightMaterial.dispose();
		}
	};
};

function readInteractiveCubeSettings(): InteractiveCubeSettings {
	return {
		background: String(templateParameters.background),
		cubeColor: String(templateParameters.cubeColor),
		gridSize: Number(templateParameters.gridSize),
		highlightColor: String(templateParameters.highlightColor)
	};
}

function createBaseMaterial(cubeColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: cubeColor,
		metalness: 0.1,
		roughness: 0.48
	});
}

function createHighlightMaterial(highlightColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: highlightColor,
		emissive: highlightColor,
		emissiveIntensity: 0.4,
		metalness: 0.08,
		roughness: 0.42
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 1.8),
		directionalLight: new DirectionalLight('#ffffff', 2.9)
	};
}

function createCubeField(
	cubeGroup: Group,
	cubeGeometry: BoxGeometry,
	baseMaterial: MeshStandardMaterial,
	gridSize: number
): Mesh[] {
	const cubeMeshes: Mesh[] = [];

	for (let zIndex = 0; zIndex < gridSize; zIndex += 1) {
		for (let xIndex = 0; xIndex < gridSize; xIndex += 1) {
			const cubeMesh = new Mesh(cubeGeometry, baseMaterial);
			cubeMesh.position.set(
				xIndex - gridSize / 2,
				Math.sin((xIndex + zIndex) * 0.6) * 0.35,
				zIndex - gridSize / 2
			);
			cubeMesh.rotation.y = (xIndex + zIndex) * 0.24;
			cubeMeshes.push(cubeMesh);
			cubeGroup.add(cubeMesh);
		}
	}

	return cubeMeshes;
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	cubeGroup: Group,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	camera.position.set(0, 2.6, 5.4);
	camera.lookAt(0, 0, 0);
	sceneLights.directionalLight.position.set(3, 4, 5);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(cubeGroup);
}

function updateHoveredCube(
	raycaster: Raycaster,
	pointer: Vector2,
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	cubeMeshes: Mesh[],
	baseMaterial: MeshStandardMaterial,
	highlightMaterial: MeshStandardMaterial,
	previousHoveredCube: Mesh | null
): Mesh | null {
	raycaster.setFromCamera(pointer, camera);
	const nextHoveredObject = raycaster.intersectObjects(cubeMeshes)[0]?.object ?? null;

	if (previousHoveredCube && previousHoveredCube !== nextHoveredObject) {
		previousHoveredCube.material = baseMaterial;
	}

	if (nextHoveredObject instanceof Mesh) {
		nextHoveredObject.material = highlightMaterial;
		return nextHoveredObject;
	}

	return null;
}
