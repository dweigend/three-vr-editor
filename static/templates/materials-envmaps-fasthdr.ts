/**
 * Purpose: Teach reflective materials with a small procedural environment map.
 * Context: Students can change the base color, metalness, and roughness to see how
 * environment lighting changes the look of reflective objects.
 * Responsibility: Build the reflective scene, create a PMREM environment, animate the
 * object group, and dispose every created WebGL resource.
 * Boundaries: This version stays self-contained and avoids external HDR assets.
 */

/* @three-template
{
	"id": "materials-envmaps-fasthdr",
	"title": "Materials Envmaps FastHDR",
	"description": "A reflective-material scene with a procedural environment map.",
	"rendererKind": "webgl",
	"tags": ["materials", "envmap", "reflection"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#020617"
		},
		{
			"key": "surfaceColor",
			"label": "Surface color",
			"control": "color",
			"defaultValue": "#f8fafc"
		},
		{
			"key": "metalness",
			"label": "Metalness",
			"control": "range",
			"min": 0,
			"max": 1,
			"step": 0.05,
			"defaultValue": 0.85
		},
		{
			"key": "roughness",
			"label": "Roughness",
			"control": "range",
			"min": 0.02,
			"max": 0.8,
			"step": 0.02,
			"defaultValue": 0.18
		}
	]
}
*/

import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
	AmbientLight,
	Color,
	DirectionalLight,
	Group,
	Mesh,
	MeshStandardMaterial,
	PMREMGenerator,
	SphereGeometry,
	Texture,
	TorusKnotGeometry
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"metalness": 0.85,
	"roughness": 0.18,
	"surfaceColor": "#f8fafc"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

type ReflectiveSceneSettings = {
	background: string;
	metalness: number;
	roughness: number;
	surfaceColor: string;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	renderer,
	scene
}): ThreeDemoSceneController => {
	const settings = readReflectiveSceneSettings();
	const pmremGenerator = new PMREMGenerator(renderer);
	const environmentTexture = createEnvironmentTexture(pmremGenerator);
	const surfaceMaterial = createSurfaceMaterial(settings);
	const knotGeometry = new TorusKnotGeometry(0.9, 0.24, 160, 24);
	const sphereGeometry = new SphereGeometry(0.48, 32, 24);
	const reflectiveGroup = createReflectiveGroup(
		knotGeometry,
		sphereGeometry,
		surfaceMaterial
	);
	const sceneLights = createSceneLights();

	configureScene(
		camera,
		scene,
		settings.background,
		environmentTexture,
		reflectiveGroup,
		sceneLights
	);

	return {
		update: () => {
			animateReflectiveGroup(reflectiveGroup);
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(reflectiveGroup);
			scene.environment = null;
			environmentTexture.dispose();
			knotGeometry.dispose();
			sphereGeometry.dispose();
			surfaceMaterial.dispose();
			pmremGenerator.dispose();
		}
	};
};

function readReflectiveSceneSettings(): ReflectiveSceneSettings {
	return {
		background: String(templateParameters.background),
		metalness: Number(templateParameters.metalness),
		roughness: Number(templateParameters.roughness),
		surfaceColor: String(templateParameters.surfaceColor)
	};
}

function createEnvironmentTexture(pmremGenerator: PMREMGenerator): Texture {
	return pmremGenerator.fromScene(new RoomEnvironment(), 0.05).texture;
}

function createSurfaceMaterial(
	settings: ReflectiveSceneSettings
): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: settings.surfaceColor,
		metalness: settings.metalness,
		roughness: settings.roughness
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 0.8),
		directionalLight: new DirectionalLight('#ffffff', 2.4)
	};
}

function createReflectiveGroup(
	knotGeometry: TorusKnotGeometry,
	sphereGeometry: SphereGeometry,
	surfaceMaterial: MeshStandardMaterial
): Group {
	const reflectiveGroup = new Group();
	const reflectiveSphere = new Mesh(sphereGeometry, surfaceMaterial);
	const reflectiveKnot = new Mesh(knotGeometry, surfaceMaterial);

	reflectiveSphere.position.set(-1.7, -0.2, 0);
	reflectiveKnot.position.set(1.2, 0.2, 0);
	reflectiveGroup.add(reflectiveSphere);
	reflectiveGroup.add(reflectiveKnot);

	return reflectiveGroup;
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	environmentTexture: Texture,
	reflectiveGroup: Group,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	scene.environment = environmentTexture;
	camera.position.set(0, 0.8, 5);
	sceneLights.directionalLight.position.set(4, 5, 6);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(reflectiveGroup);
}

function animateReflectiveGroup(reflectiveGroup: Group): void {
	reflectiveGroup.rotation.y += 0.008;
	reflectiveGroup.rotation.x = Math.sin(reflectiveGroup.rotation.y * 0.6) * 0.16;
}
