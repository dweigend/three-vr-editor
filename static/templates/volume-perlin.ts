/**
 * Purpose: Provide a compact volumetric-noise scene inspired by the official WebGPU Perlin volume example.
 * Context: The template workbench uses this file to demonstrate a volumetric-looking WebGPU scene without external assets.
 * Responsibility: Generate a 3D field of thresholded points from noise, animate them subtly, and clean up resources.
 * Boundaries: This simplified variant keeps the volumetric idea while avoiding the full shader-heavy original example.
 */

/* @three-template
{
	"id": "volume-perlin",
	"title": "Volume Perlin",
	"description": "A compact cloud of thresholded Perlin points rendered on the WebGPU path.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "volume", "noise"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#020617" },
		{ "key": "density", "label": "Density threshold", "control": "range", "min": 0.1, "max": 0.8, "step": 0.05, "defaultValue": 0.42 },
		{ "key": "pointSize", "label": "Point size", "control": "range", "min": 0.03, "max": 0.18, "step": 0.01, "defaultValue": 0.08 },
		{ "key": "cloudColor", "label": "Cloud color", "control": "color", "defaultValue": "#93c5fd" }
	]
}
*/

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"cloudColor": "#93c5fd",
	"density": 0.42,
	"pointSize": 0.08
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

const noise = new ImprovedNoise();

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const gridSize = 18;
	const points: number[] = [];
	const colors: number[] = [];
	const cloudGeometry = new THREE.BufferGeometry();
	const cloudMaterial = new THREE.PointsMaterial({
		color: String(templateParameters.cloudColor),
		opacity: 0.72,
		size: Number(templateParameters.pointSize),
		transparent: true
	});
	const cloudColor = new THREE.Color(String(templateParameters.cloudColor));

	for (let z = 0; z < gridSize; z += 1) {
		for (let y = 0; y < gridSize; y += 1) {
			for (let x = 0; x < gridSize; x += 1) {
				const sample =
					noise.noise(x * 0.15, y * 0.15, z * 0.15) * 0.5 +
					noise.noise(x * 0.32, y * 0.32, z * 0.32) * 0.5;

				if (sample < Number(templateParameters.density)) {
					continue;
				}

				points.push(
					(x / gridSize - 0.5) * 5,
					(y / gridSize - 0.5) * 5,
					(z / gridSize - 0.5) * 5
				);
				colors.push(cloudColor.r, cloudColor.g, cloudColor.b);
			}
		}
	}

	cloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
	cloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	cloudMaterial.vertexColors = true;

	const cloud = new THREE.Points(cloudGeometry, cloudMaterial);
	const ambientLight = new THREE.AmbientLight('#ffffff', 1.2);
	const directionalLight = new THREE.DirectionalLight('#ffffff', 1.6);

	scene.background = new THREE.Color(String(templateParameters.background));
	camera.position.set(0, 0, 8);
	directionalLight.position.set(4, 6, 5);
	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(cloud);

	return {
		update: () => {
			cloud.rotation.y += 0.003;
			cloud.rotation.x = Math.sin(cloud.rotation.y * 0.7) * 0.2;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(cloud);
			cloudGeometry.dispose();
			cloudMaterial.dispose();
		}
	};
};
