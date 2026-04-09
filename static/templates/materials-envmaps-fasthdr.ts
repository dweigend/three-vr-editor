/** Start here if you want reflective materials without loading an HDR file. */

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
	TorusKnotGeometry,
	WebGLRenderTarget,
	type PerspectiveCamera,
	type Scene,
	type WebGLRenderer
} from 'three';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';

// The editor sidebar reads this to build the labels and controls.
export const templateUi = defineThreeTemplateUi({
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
});

// These are the values students can play with first.
export const templateParameters = defineThreeTemplateParameters({
	"background": "#020617",
	"metalness": 0.85,
	"roughness": 0.18,
	"surfaceColor": "#f8fafc"
});

type ReflectiveSettings = {
	background: string;
	metalness: number;
	roughness: number;
	surfaceColor: string;
};

type EnvironmentMap = {
	target: WebGLRenderTarget;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	renderer,
	scene
}) => {
	const webglRenderer = renderer as WebGLRenderer;
	const settings = readReflectiveSettings();
	const pmremGenerator = new PMREMGenerator(webglRenderer);
	const environmentMap = createEnvironmentMap(pmremGenerator);
	const surfaceMaterial = createSurfaceMaterial(settings);
	const knotGeometry = new TorusKnotGeometry(0.9, 0.24, 160, 24);
	const sphereGeometry = new SphereGeometry(0.48, 32, 24);
	const reflectiveGroup = createReflectiveGroup(
		knotGeometry,
		sphereGeometry,
		surfaceMaterial
	);
	const sceneLights = createSceneLights();

	setupScene(
		camera,
		scene,
		settings.background,
		environmentMap,
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
			environmentMap.target.dispose();
			knotGeometry.dispose();
			sphereGeometry.dispose();
			surfaceMaterial.dispose();
			pmremGenerator.dispose();
		}
	};
};

function readReflectiveSettings(): ReflectiveSettings {
	return {
		background: String(templateParameters.background),
		metalness: Number(templateParameters.metalness),
		roughness: Number(templateParameters.roughness),
		surfaceColor: String(templateParameters.surfaceColor)
	};
}

function createEnvironmentMap(pmremGenerator: PMREMGenerator): EnvironmentMap {
	// PMREM blurs the scene into an environment texture that reflections can sample.
	return {
		target: pmremGenerator.fromScene(new RoomEnvironment(), 0.05)
	};
}

function createSurfaceMaterial(
	settings: ReflectiveSettings
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

function setupScene(
	camera: PerspectiveCamera,
	scene: Scene,
	background: string,
	environmentMap: EnvironmentMap,
	reflectiveGroup: Group,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	scene.environment = environmentMap.target.texture;
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
