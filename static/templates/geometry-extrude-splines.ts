import {
	AmbientLight,
	CatmullRomCurve3,
	Color,
	DirectionalLight,
	ExtrudeGeometry,
	Mesh,
	MeshStandardMaterial,
	Shape,
	Vector2,
	Vector3,
	type PerspectiveCamera,
	type Scene
} from 'three';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';
export const templateUi = defineThreeTemplateUi({
	"id": "geometry-extrude-splines",
	"title": "Geometry Extrude Splines",
	"description": "Switch the profile and change how fast the shape twists.",
	"rendererKind": "webgl",
	"tags": ["geometry", "extrude", "splines"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#111827"
		},
		{
			"key": "surfaceColor",
			"label": "Surface color",
			"control": "color",
			"defaultValue": "#a855f7"
		},
		{
			"key": "profile",
			"label": "Profile",
			"control": "select",
			"defaultValue": "star",
			"options": [
				{ "label": "Star", "value": "star" },
				{ "label": "Rounded", "value": "rounded" }
			]
		},
		{
			"key": "twistSpeed",
			"label": "Twist speed",
			"control": "range",
			"min": 0.001,
			"max": 0.02,
			"step": 0.001,
			"defaultValue": 0.006
		}
	]
});
export const templateParameters = defineThreeTemplateParameters({
	"background": "#111827",
	"profile": "star",
	"surfaceColor": "#a855f7",
	"twistSpeed": 0.006
});

type ProfileKind = 'rounded' | 'star';

type ExtrudeSettings = {
	background: string;
	profile: ProfileKind;
	surfaceColor: string;
	twistSpeed: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readExtrudeSettings();
	const splinePath = createSplinePath();
	const profileShape = createProfileShape(settings.profile);
	const extrudedGeometry = new ExtrudeGeometry(profileShape, {
		bevelEnabled: true,
		bevelSegments: 4,
		bevelSize: 0.04,
		bevelThickness: 0.06,
		curveSegments: 18,
		extrudePath: splinePath,
		steps: 80
	});
	const surfaceMaterial = new MeshStandardMaterial({
		color: settings.surfaceColor,
		metalness: 0.18,
		roughness: 0.26
	});
	const extrudedMesh = new Mesh(extrudedGeometry, surfaceMaterial);
	const sceneLights = createSceneLights();

	setupScene(camera, scene, settings.background, extrudedMesh, sceneLights);

	return {
		update: () => {
			extrudedMesh.rotation.y += settings.twistSpeed;
			extrudedMesh.rotation.x =
				Math.sin(extrudedMesh.rotation.y * 0.5) * 0.2;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(extrudedMesh);
			extrudedGeometry.dispose();
			surfaceMaterial.dispose();
		}
	};
};

function readExtrudeSettings(): ExtrudeSettings {
	return {
		background: String(templateParameters.background),
		profile: readProfileKind(String(templateParameters.profile)),
		surfaceColor: String(templateParameters.surfaceColor),
		twistSpeed: Number(templateParameters.twistSpeed)
	};
}

function createSplinePath(): CatmullRomCurve3 {
	return new CatmullRomCurve3([
		new Vector3(-2.2, -0.8, 0),
		new Vector3(-1.2, 1.3, 0.8),
		new Vector3(0.8, -0.5, -0.8),
		new Vector3(2.1, 0.9, 0)
	]);
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 2.1),
		directionalLight: new DirectionalLight('#ffffff', 3)
	};
}

function setupScene(
	camera: PerspectiveCamera,
	scene: Scene,
	background: string,
	extrudedMesh: Mesh,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	camera.position.set(0, 1.2, 5.6);
	sceneLights.directionalLight.position.set(4, 4, 5);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(extrudedMesh);
}

function readProfileKind(value: string): ProfileKind {
	return value === 'rounded' ? 'rounded' : 'star';
}

function createProfileShape(profile: ProfileKind): Shape {
	if (profile === 'rounded') {
		const roundedShape = new Shape();
		roundedShape.absarc(0, 0, 0.45, 0, Math.PI * 2);
		return roundedShape;
	}

	return new Shape([
		new Vector2(0, 0.56),
		new Vector2(0.14, 0.16),
		new Vector2(0.54, 0.16),
		new Vector2(0.22, -0.08),
		new Vector2(0.34, -0.5),
		new Vector2(0, -0.24),
		new Vector2(-0.34, -0.5),
		new Vector2(-0.22, -0.08),
		new Vector2(-0.54, 0.16),
		new Vector2(-0.14, 0.16)
	]);
}
