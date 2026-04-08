/**
 * Purpose: Provide a template-friendly extruded spline scene inspired by the official geometry extrude splines example.
 * Context: The workbench uses this scene to demonstrate path-based geometry generation from a self-contained file.
 * Responsibility: Build one profile shape, extrude it along a smooth spline, animate it, and dispose resources cleanly.
 * Boundaries: Renderer creation, resize handling, and route composition stay outside this module.
 */

/* @three-template
{
	"id": "geometry-extrude-splines",
	"title": "Geometry Extrude Splines",
	"description": "An extruded ribbon profile travelling along a curved spline path.",
	"rendererKind": "webgl",
	"tags": ["geometry", "extrude", "splines"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#111827" },
		{ "key": "surfaceColor", "label": "Surface color", "control": "color", "defaultValue": "#a855f7" },
		{ "key": "profile", "label": "Profile", "control": "select", "defaultValue": "star", "options": [
			{ "label": "Star", "value": "star" },
			{ "label": "Rounded", "value": "rounded" }
		] },
		{ "key": "twistSpeed", "label": "Twist speed", "control": "range", "min": 0.001, "max": 0.02, "step": 0.001, "defaultValue": 0.006 }
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
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#111827",
	"profile": "star",
	"surfaceColor": "#a855f7",
	"twistSpeed": 0.006
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const path = new CatmullRomCurve3([
		new Vector3(-2.2, -0.8, 0),
		new Vector3(-1.2, 1.3, 0.8),
		new Vector3(0.8, -0.5, -0.8),
		new Vector3(2.1, 0.9, 0)
	]);
	const geometry = new ExtrudeGeometry(createProfileShape(String(templateParameters.profile)), {
		bevelEnabled: true,
		bevelSegments: 4,
		bevelSize: 0.04,
		bevelThickness: 0.06,
		curveSegments: 18,
		extrudePath: path,
		steps: 80
	});
	const material = new MeshStandardMaterial({
		color: String(templateParameters.surfaceColor),
		metalness: 0.18,
		roughness: 0.26
	});
	const extrudedMesh = new Mesh(geometry, material);
	const ambientLight = new AmbientLight('#ffffff', 2.1);
	const directionalLight = new DirectionalLight('#ffffff', 3);

	scene.background = new Color(String(templateParameters.background));
	camera.position.set(0, 1.2, 5.6);
	directionalLight.position.set(4, 4, 5);

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(extrudedMesh);

	return {
		update: () => {
			const twistSpeed = Number(templateParameters.twistSpeed);
			extrudedMesh.rotation.y += twistSpeed;
			extrudedMesh.rotation.x = Math.sin(extrudedMesh.rotation.y * 0.5) * 0.2;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(extrudedMesh);
			geometry.dispose();
			material.dispose();
		}
	};
};

function createProfileShape(profile: string): Shape {
	if (profile === 'rounded') {
		const shape = new Shape();
		shape.absarc(0, 0, 0.45, 0, Math.PI * 2);
		shape.holes = [];
		return shape;
	}

	const points = [
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
	];

	return new Shape(points);
}
