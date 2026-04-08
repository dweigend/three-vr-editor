/**
 * Purpose: Provide a pointer-reactive cube scene inspired by the official interactive cubes example.
 * Context: The template workbench uses this file to demonstrate local scene interaction without route-specific code.
 * Responsibility: Build a grid of cubes, raycast the pointer, highlight the hovered mesh, and clean up listeners.
 * Boundaries: This scene keeps the interaction local and omits demo overlays or external UI state.
 */

/* @three-template
{
	"id": "interactive-cubes",
	"title": "Interactive Cubes",
	"description": "A small interactive cube field that highlights the currently hovered block.",
	"rendererKind": "webgl",
	"tags": ["interaction", "raycast", "cubes"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#111827" },
		{ "key": "cubeColor", "label": "Cube color", "control": "color", "defaultValue": "#60a5fa" },
		{ "key": "highlightColor", "label": "Highlight color", "control": "color", "defaultValue": "#fbbf24" },
		{ "key": "gridSize", "label": "Grid size", "control": "range", "min": 3, "max": 8, "step": 1, "defaultValue": 5 }
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
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#111827",
	"cubeColor": "#60a5fa",
	"gridSize": 5,
	"highlightColor": "#fbbf24"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	scene
}): ThreeDemoSceneController => {
	const gridSize = Number(templateParameters.gridSize);
	const geometry = new BoxGeometry(0.72, 0.72, 0.72);
	const baseMaterial = new MeshStandardMaterial({
		color: String(templateParameters.cubeColor),
		metalness: 0.1,
		roughness: 0.48
	});
	const highlightMaterial = new MeshStandardMaterial({
		color: String(templateParameters.highlightColor),
		emissive: String(templateParameters.highlightColor),
		emissiveIntensity: 0.4,
		metalness: 0.08,
		roughness: 0.42
	});
	const cubes: Mesh[] = [];
	const cubeGroup = new Group();
	const ambientLight = new AmbientLight('#ffffff', 1.8);
	const directionalLight = new DirectionalLight('#ffffff', 2.9);
	const raycaster = new Raycaster();
	const pointer = new Vector2(0, 0);
	let hoveredCube: Mesh | null = null;

	scene.background = new Color(String(templateParameters.background));
	camera.position.set(0, 2.6, 5.4);
	camera.lookAt(0, 0, 0);
	directionalLight.position.set(3, 4, 5);

	for (let z = 0; z < gridSize; z += 1) {
		for (let x = 0; x < gridSize; x += 1) {
			const cube = new Mesh(geometry, baseMaterial);
			cube.position.set(x - gridSize / 2, Math.sin((x + z) * 0.6) * 0.35, z - gridSize / 2);
			cube.rotation.y = (x + z) * 0.24;
			cubes.push(cube);
			cubeGroup.add(cube);
		}
	}

	const handlePointerMove = (event: PointerEvent) => {
		const bounds = container.getBoundingClientRect();
		pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
	};

	container.addEventListener('pointermove', handlePointerMove);
	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(cubeGroup);

	return {
		update: () => {
			cubeGroup.rotation.y += 0.003;
			raycaster.setFromCamera(pointer, camera);

			const hovered = raycaster.intersectObjects(cubes)[0]?.object ?? null;

			if (hoveredCube && hoveredCube !== hovered) {
				hoveredCube.material = baseMaterial;
				hoveredCube = null;
			}

			if (hovered instanceof Mesh && hoveredCube !== hovered) {
				hovered.material = highlightMaterial;
				hoveredCube = hovered;
			}
		},
		dispose: () => {
			container.removeEventListener('pointermove', handlePointerMove);
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(cubeGroup);
			geometry.dispose();
			baseMaterial.dispose();
			highlightMaterial.dispose();
		}
	};
};
