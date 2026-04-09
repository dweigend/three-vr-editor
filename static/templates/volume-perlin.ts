/** Start here if you want a soft cloud built from layered noise samples. */

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as THREE from 'three/webgpu';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';

// The editor sidebar reads this to build the labels and controls.
export const templateUi = defineThreeTemplateUi({
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
});

// These are the values students can play with first.
export const templateParameters = defineThreeTemplateParameters({
	"background": "#020617",
	"cloudColor": "#93c5fd",
	"density": 0.42,
	"pointSize": 0.08
});

export const demoRendererKind = 'webgpu';

const cloudNoise = new ImprovedNoise();

type VolumeSettings = {
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

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readVolumeSettings();
	const cloudData = createCloudData(settings);
	const cloudGeometry = new THREE.BufferGeometry();
	const cloudMaterial = createCloudMaterial(settings);
	const cloudPoints = createCloudPoints(cloudGeometry, cloudMaterial, cloudData);
	const sceneLights = createSceneLights();

	setupScene(camera, scene, settings.background, cloudPoints, sceneLights);

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

function readVolumeSettings(): VolumeSettings {
	return {
		background: String(templateParameters.background),
		cloudColor: String(templateParameters.cloudColor),
		density: Number(templateParameters.density),
		pointSize: Number(templateParameters.pointSize)
	};
}

function createCloudData(settings: VolumeSettings): CloudData {
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

function createCloudMaterial(settings: VolumeSettings): THREE.PointsMaterial {
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

function setupScene(
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
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
	// Two noise layers give the cloud a softer shape without needing a shader.
	return (
		cloudNoise.noise(xIndex * 0.15, yIndex * 0.15, zIndex * 0.15) * 0.5 +
		cloudNoise.noise(xIndex * 0.32, yIndex * 0.32, zIndex * 0.32) * 0.5
	);
}
