/**
 * Purpose: Teach how one 2D profile can be extruded along a 3D spline path.
 * Context: Students can switch the profile shape and watch the ribbon twist in place.
 * Responsibility: Build the spline, extrude one profile along it, animate the result,
 * and clean up all created geometry and materials.
 * Boundaries: This template stays focused on extrusion and omits the larger
 * original demo.
 */

/* @three-template
{
	"id": "geometry-extrude-splines",
	"title": "Geometry Extrude Splines",
	"description": "An extruded profile that follows a curved spline path.",
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
}
*/

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
	Vector3
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#111827",
	"profile": "star",
	"surfaceColor": "#a855f7",
	"twistSpeed": 0.006
} satisfies Record<string, number | string>;
// @three-template-parameters:end

type ProfileKind = 'rounded' | 'star';

type ExtrudeSceneSettings = {
	background: string;
	profile: ProfileKind;
	surfaceColor: string;
	twistSpeed: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	scene
}): ThreeDemoSceneController => {
	const settings = readExtrudeSceneSettings();
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
	const surfaceMaterial = createSurfaceMaterial(settings.surfaceColor);
	const extrudedMesh = new Mesh(extrudedGeometry, surfaceMaterial);
	const sceneLights = createSceneLights();

	configureScene(camera, scene, settings.background, extrudedMesh, sceneLights);

	return {
		update: () => {
			animateExtrusion(extrudedMesh, settings.twistSpeed);
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

function readExtrudeSceneSettings(): ExtrudeSceneSettings {
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

function createSurfaceMaterial(surfaceColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: surfaceColor,
		metalness: 0.18,
		roughness: 0.26
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 2.1),
		directionalLight: new DirectionalLight('#ffffff', 3)
	};
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
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

function animateExtrusion(extrudedMesh: Mesh, twistSpeed: number): void {
	extrudedMesh.rotation.y += twistSpeed;
	extrudedMesh.rotation.x = Math.sin(extrudedMesh.rotation.y * 0.5) * 0.2;
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
