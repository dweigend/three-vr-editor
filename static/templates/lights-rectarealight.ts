/**
 * Purpose: Teach how a rectangular area light shapes the look of a simple scene.
 * Context: Students can change the light color, intensity, and panel width to see how
 * the highlight on the sphere changes.
 * Responsibility: Build the lit room, animate the sphere, and clean up every created mesh
 * and material.
 * Boundaries: This scene stays compact and avoids the extra controls from the full demo.
 */

/* @three-template
{
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
}
*/

import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"intensity": 12,
	"lightColor": "#fb7185",
	"panelWidth": 3.2
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

type RectAreaSceneSettings = {
	background: string;
	intensity: number;
	lightColor: string;
	panelWidth: number;
};

type RoomScene = {
	accentLight: THREE.PointLight;
	areaLight: THREE.RectAreaLight;
	roomMesh: THREE.Mesh;
	sphereMesh: THREE.Mesh;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readRectAreaSceneSettings();
	const roomScene = createRoomScene(settings);

	configureScene(camera, scene, settings.background, roomScene);

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
			(roomScene.roomMesh.material as THREE.MeshStandardMaterial).dispose();
			roomScene.sphereMesh.geometry.dispose();
			(roomScene.sphereMesh.material as THREE.MeshStandardMaterial).dispose();
		}
	};
};

function readRectAreaSceneSettings(): RectAreaSceneSettings {
	return {
		background: String(templateParameters.background),
		intensity: Number(templateParameters.intensity),
		lightColor: String(templateParameters.lightColor),
		panelWidth: Number(templateParameters.panelWidth)
	};
}

function createRoomScene(settings: RectAreaSceneSettings): RoomScene {
	const roomMesh = new THREE.Mesh(
		new THREE.BoxGeometry(8, 5, 8),
		new THREE.MeshStandardMaterial({
			color: '#0f172a',
			metalness: 0,
			roughness: 0.96,
			side: THREE.BackSide
		})
	);
	const sphereMesh = new THREE.Mesh(
		new THREE.SphereGeometry(1.1, 48, 32),
		new THREE.MeshStandardMaterial({
			color: '#e2e8f0',
			metalness: 0.35,
			roughness: 0.22
		})
	);
	const areaLight = new THREE.RectAreaLight(
		settings.lightColor,
		settings.intensity,
		settings.panelWidth,
		1.8
	);
	const accentLight = new THREE.PointLight('#60a5fa', 16, 12);

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

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
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
