/**
 * Purpose: Teach a volumetric-looking point cloud built from layered Perlin noise.
 * Context: Students can change the density threshold and point size to see how noise
 * samples become a soft cloud of points.
 * Responsibility: Build the point cloud, animate it gently, and clean up the generated
 * geometry and material.
 * Boundaries: This template keeps the volumetric idea simple and avoids custom shaders.
 */

/* @three-template
{
	"id": "volume-perlin",
	"title": "Volume Perlin",
	"description": "A compact cloud of Perlin-noise points on the WebGPU path.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "volume", "noise"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#020617"
		},
		{
			"key": "density",
			"label": "Density threshold",
			"control": "range",
			"min": 0.1,
			"max": 0.8,
			"step": 0.05,
			"defaultValue": 0.42
		},
		{
			"key": "pointSize",
			"label": "Point size",
			"control": "range",
			"min": 0.03,
			"max": 0.18,
			"step": 0.01,
			"defaultValue": 0.08
		},
		{
			"key": "cloudColor",
			"label": "Cloud color",
			"control": "color",
			"defaultValue": "#93c5fd"
		}
	]
}
*/

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"cloudColor": "#93c5fd",
	"density": 0.42,
	"pointSize": 0.08
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

const cloudNoise = new ImprovedNoise();

type VolumeSceneSettings = {
	background: string;
	cloudColor: string;
	density: number;
	pointSize: number;
};

type CloudData = {
	colors: number[];
	positions: number[];
};

type SceneLights = {
	ambientLight: THREE.AmbientLight;
	directionalLight: THREE.DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readVolumeSceneSettings();
	const cloudData = createCloudData(settings);
	const cloudGeometry = new THREE.BufferGeometry();
	const cloudMaterial = createCloudMaterial(settings);
	const cloudPoints = createCloudPoints(cloudGeometry, cloudMaterial, cloudData);
	const sceneLights = createSceneLights();

	configureScene(camera, scene, settings.background, cloudPoints, sceneLights);

	return {
		update: () => {
			cloudPoints.rotation.y += 0.003;
			cloudPoints.rotation.x = Math.sin(cloudPoints.rotation.y * 0.7) * 0.2;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(cloudPoints);
			cloudGeometry.dispose();
			cloudMaterial.dispose();
		}
	};
};

function readVolumeSceneSettings(): VolumeSceneSettings {
	return {
		background: String(templateParameters.background),
		cloudColor: String(templateParameters.cloudColor),
		density: Number(templateParameters.density),
		pointSize: Number(templateParameters.pointSize)
	};
}

function createCloudData(settings: VolumeSceneSettings): CloudData {
	const gridSize = 18;
	const positions: number[] = [];
	const colors: number[] = [];
	const cloudColor = new THREE.Color(settings.cloudColor);

	for (let zIndex = 0; zIndex < gridSize; zIndex += 1) {
		for (let yIndex = 0; yIndex < gridSize; yIndex += 1) {
			for (let xIndex = 0; xIndex < gridSize; xIndex += 1) {
				const densitySample = readDensitySample(xIndex, yIndex, zIndex);

				if (densitySample < settings.density) {
					continue;
				}

				positions.push(
					(xIndex / gridSize - 0.5) * 5,
					(yIndex / gridSize - 0.5) * 5,
					(zIndex / gridSize - 0.5) * 5
				);
				colors.push(cloudColor.r, cloudColor.g, cloudColor.b);
			}
		}
	}

	return { colors, positions };
}

function createCloudMaterial(settings: VolumeSceneSettings): THREE.PointsMaterial {
	const cloudMaterial = new THREE.PointsMaterial({
		color: settings.cloudColor,
		opacity: 0.72,
		size: settings.pointSize,
		transparent: true
	});

	cloudMaterial.vertexColors = true;
	return cloudMaterial;
}

function createCloudPoints(
	cloudGeometry: THREE.BufferGeometry,
	cloudMaterial: THREE.PointsMaterial,
	cloudData: CloudData
): THREE.Points {
	cloudGeometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute(cloudData.positions, 3)
	);
	cloudGeometry.setAttribute(
		'color',
		new THREE.Float32BufferAttribute(cloudData.colors, 3)
	);

	return new THREE.Points(cloudGeometry, cloudMaterial);
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new THREE.AmbientLight('#ffffff', 1.2),
		directionalLight: new THREE.DirectionalLight('#ffffff', 1.6)
	};
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	cloudPoints: THREE.Points,
	sceneLights: SceneLights
): void {
	scene.background = new THREE.Color(background);
	camera.position.set(0, 0, 8);
	sceneLights.directionalLight.position.set(4, 6, 5);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(cloudPoints);
}

function readDensitySample(
	xIndex: number,
	yIndex: number,
	zIndex: number
): number {
	return (
		cloudNoise.noise(xIndex * 0.15, yIndex * 0.15, zIndex * 0.15) * 0.5 +
		cloudNoise.noise(xIndex * 0.32, yIndex * 0.32, zIndex * 0.32) * 0.5
	);
}
