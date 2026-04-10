import * as THREE from 'three/webgpu';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';
export const templateUi = defineThreeTemplateUi({
	"id": "lights-rectarealight",
	"title": "Lights RectAreaLight",
	"description": "A compact rectangular area light demo on the WebGPU path.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "lighting", "rect-area-light"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#020617"
		},
		{
			"key": "lightColor",
			"label": "Light color",
			"control": "color",
			"defaultValue": "#fb7185"
		},
		{
			"key": "intensity",
			"label": "Intensity",
			"control": "range",
			"min": 1,
			"max": 24,
			"step": 0.5,
			"defaultValue": 12
		},
		{
			"key": "panelWidth",
			"label": "Panel width",
			"control": "range",
			"min": 1,
			"max": 6,
			"step": 0.2,
			"defaultValue": 3.2
		}
	]
});
export const templateParameters = defineThreeTemplateParameters({
	"background": "#020617",
	"intensity": 12,
	"lightColor": "#fb7185",
	"panelWidth": 3.2
});

export const demoRendererKind = 'webgpu';

type RectAreaSettings = {
	background: string;
	intensity: number;
	lightColor: string;
	panelWidth: number;
};

type RoomMesh = THREE.Mesh<
	THREE.BoxGeometry,
	THREE.MeshStandardMaterial
>;

type SphereMesh = THREE.Mesh<
	THREE.SphereGeometry,
	THREE.MeshStandardMaterial
>;

type RoomScene = {
	accentLight: THREE.PointLight;
	areaLight: THREE.RectAreaLight;
	roomMesh: RoomMesh;
	sphereMesh: SphereMesh;
};

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readRectAreaSettings();
	const roomScene = createRoomScene(settings);

	setupScene(camera, scene, settings.background, roomScene);

	return {
		update: () => {
			roomScene.sphereMesh.rotation.y += 0.01;
			roomScene.sphereMesh.rotation.x =
				Math.sin(roomScene.sphereMesh.rotation.y * 0.5) * 0.15;
		},
		dispose: () => {
			scene.remove(roomScene.roomMesh);
			scene.remove(roomScene.sphereMesh);
			scene.remove(roomScene.areaLight);
			scene.remove(roomScene.accentLight);
			roomScene.roomMesh.geometry.dispose();
			roomScene.sphereMesh.geometry.dispose();
			roomScene.roomMesh.material.dispose();
			roomScene.sphereMesh.material.dispose();
		}
	};
};

function readRectAreaSettings(): RectAreaSettings {
	return {
		background: String(templateParameters.background),
		intensity: Number(templateParameters.intensity),
		lightColor: String(templateParameters.lightColor),
		panelWidth: Number(templateParameters.panelWidth)
	};
}

function createRoomScene(settings: RectAreaSettings): RoomScene {
	const roomMesh = createRoomMesh();
	const sphereMesh = createSphereMesh();
	const areaLight = createAreaLight(settings);
	const accentLight = createAccentLight();

	sphereMesh.position.y = 0.2;
	areaLight.position.set(0, 2.1, 2.8);
	areaLight.lookAt(0, 0.6, 0);
	accentLight.position.set(-2.2, 1.2, -2.4);

	return {
		accentLight,
		areaLight,
		roomMesh,
		sphereMesh
	};
}

function createRoomMesh(): RoomMesh {
	return new THREE.Mesh(
		new THREE.BoxGeometry(8, 5, 8),
		new THREE.MeshStandardMaterial({
			color: '#0f172a',
			metalness: 0,
			roughness: 0.96,
			side: THREE.BackSide
		})
	);
}

function createSphereMesh(): SphereMesh {
	return new THREE.Mesh(
		new THREE.SphereGeometry(1.1, 48, 32),
		new THREE.MeshStandardMaterial({
			color: '#e2e8f0',
			metalness: 0.35,
			roughness: 0.22
		})
	);
}

function createAreaLight(settings: RectAreaSettings): THREE.RectAreaLight {
	return new THREE.RectAreaLight(
		settings.lightColor,
		settings.intensity,
		settings.panelWidth,
		1.8
	);
}

function createAccentLight(): THREE.PointLight {
	return new THREE.PointLight('#60a5fa', 16, 12);
}

function setupScene(
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
	background: string,
	roomScene: RoomScene
): void {
	scene.background = new THREE.Color(background);
	camera.position.set(0, 1.4, 7);

	scene.add(roomScene.roomMesh);
	scene.add(roomScene.sphereMesh);
	scene.add(roomScene.areaLight);
	scene.add(roomScene.accentLight);
}
