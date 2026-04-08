/**
 * Purpose: Provide a WebGPU-ready rectangular area light scene inspired by the official rect area light example.
 * Context: The template workbench uses this file to demonstrate the additive WebGPU renderer path with a focused lighting setup.
 * Responsibility: Build a small lit stage around one sphere and expose the main light shape and intensity controls.
 * Boundaries: This scene omits inspector tooling and external controls in favor of a compact managed example.
 */

/* @three-template
{
	"id": "lights-rectarealight",
	"title": "Lights RectAreaLight",
	"description": "A compact rectangular area light demo on the WebGPU renderer path.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "lighting", "rect-area-light"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#020617" },
		{ "key": "lightColor", "label": "Light color", "control": "color", "defaultValue": "#fb7185" },
		{ "key": "intensity", "label": "Intensity", "control": "range", "min": 1, "max": 24, "step": 0.5, "defaultValue": 12 },
		{ "key": "panelWidth", "label": "Panel width", "control": "range", "min": 1, "max": 6, "step": 0.2, "defaultValue": 3.2 }
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
	"intensity": 12,
	"lightColor": "#fb7185",
	"panelWidth": 3.2
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const room = new THREE.Mesh(
		new THREE.BoxGeometry(8, 5, 8),
		new THREE.MeshStandardMaterial({
			color: '#0f172a',
			metalness: 0,
			roughness: 0.96,
			side: THREE.BackSide
		})
	);
	const sphere = new THREE.Mesh(
		new THREE.SphereGeometry(1.1, 48, 32),
		new THREE.MeshStandardMaterial({
			color: '#e2e8f0',
			metalness: 0.35,
			roughness: 0.22
		})
	);
	const areaLight = new THREE.RectAreaLight(
		String(templateParameters.lightColor),
		Number(templateParameters.intensity),
		Number(templateParameters.panelWidth),
		1.8
	);
	const accentLight = new THREE.PointLight('#60a5fa', 16, 12);

	scene.background = new THREE.Color(String(templateParameters.background));
	camera.position.set(0, 1.4, 7);
	areaLight.position.set(0, 2.1, 2.8);
	areaLight.lookAt(0, 0.6, 0);
	accentLight.position.set(-2.2, 1.2, -2.4);
	sphere.position.y = 0.2;

	scene.add(room);
	scene.add(sphere);
	scene.add(areaLight);
	scene.add(accentLight);

	return {
		update: () => {
			sphere.rotation.y += 0.01;
			sphere.rotation.x = Math.sin(sphere.rotation.y * 0.5) * 0.15;
		},
		dispose: () => {
			scene.remove(room);
			scene.remove(sphere);
			scene.remove(areaLight);
			scene.remove(accentLight);
			room.geometry.dispose();
			(room.material as THREE.MeshStandardMaterial).dispose();
			sphere.geometry.dispose();
			(sphere.material as THREE.MeshStandardMaterial).dispose();
		}
	};
};
