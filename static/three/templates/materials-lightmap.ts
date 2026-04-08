/**
 * Purpose: Provide a compact lightmap material scene inspired by the official lightmap example.
 * Context: The template workbench uses this scene to demonstrate a self-contained baked-light look on the WebGPU path.
 * Responsibility: Generate a small procedural light map, apply it to geometry, and expose the lightmap intensity.
 * Boundaries: This simplified scene avoids external model assets and keeps the UV setup local.
 */

/* @three-template
{
	"id": "materials-lightmap",
	"title": "Materials Lightmap",
	"description": "A procedural lightmap scene with one baked-looking box and floor setup.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "materials", "lightmap"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#111827" },
		{ "key": "baseColor", "label": "Base color", "control": "color", "defaultValue": "#e5e7eb" },
		{ "key": "lightMapIntensity", "label": "Lightmap intensity", "control": "range", "min": 0.2, "max": 3, "step": 0.1, "defaultValue": 1.4 },
		{ "key": "accentColor", "label": "Accent color", "control": "color", "defaultValue": "#60a5fa" }
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
	"accentColor": "#60a5fa",
	"background": "#111827",
	"baseColor": "#e5e7eb",
	"lightMapIntensity": 1.4
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const lightMap = createLightMapTexture(String(templateParameters.accentColor));
	const floorGeometry = new THREE.PlaneGeometry(8, 8);
	const boxGeometry = new THREE.BoxGeometry(2, 2.6, 2);
	const material = new THREE.MeshStandardMaterial({
		color: String(templateParameters.baseColor),
		lightMap,
		lightMapIntensity: Number(templateParameters.lightMapIntensity),
		metalness: 0.02,
		roughness: 0.86
	});
	const floor = new THREE.Mesh(
		floorGeometry,
		new THREE.MeshStandardMaterial({
			color: '#1f2937',
			metalness: 0,
			roughness: 0.92
		})
	);
	const box = new THREE.Mesh(boxGeometry, material);
	const ambientLight = new THREE.AmbientLight('#ffffff', 1.2);
	const directionalLight = new THREE.DirectionalLight('#ffffff', 1.8);

	copyUvChannel(boxGeometry);

	scene.background = new THREE.Color(String(templateParameters.background));
	camera.position.set(0, 2.6, 7);
	directionalLight.position.set(4, 5, 4);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -1.3;

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(floor);
	scene.add(box);

	return {
		update: () => {
			box.rotation.y += 0.008;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(floor);
			scene.remove(box);
			lightMap.dispose();
			floorGeometry.dispose();
			boxGeometry.dispose();
			(floor.material as THREE.MeshStandardMaterial).dispose();
			material.dispose();
		}
	};
};

function copyUvChannel(geometry: THREE.BufferGeometry): void {
	const uvAttribute = geometry.getAttribute('uv');

	if (!uvAttribute) {
		return;
	}

	geometry.setAttribute('uv1', uvAttribute.clone());
	geometry.setAttribute('uv2', uvAttribute.clone());
}

function createLightMapTexture(accentColor: string): THREE.CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;

	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Unable to create light map canvas.');
	}

	const gradient = context.createRadialGradient(160, 90, 16, 128, 128, 180);
	gradient.addColorStop(0, accentColor);
	gradient.addColorStop(0.4, '#f8fafc');
	gradient.addColorStop(1, '#111827');

	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}
