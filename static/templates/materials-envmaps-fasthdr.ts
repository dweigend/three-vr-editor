/**
 * Purpose: Provide a compact reflective-material scene inspired by the official environment map FastHDR example.
 * Context: The template workbench uses this file as a self-contained reflective-material starter without external HDR assets.
 * Responsibility: Build a reflective object cluster, derive an environment from RoomEnvironment, and expose material tuning parameters.
 * Boundaries: This simplified variant intentionally swaps the large HDR asset pipeline for a procedural room environment.
 */

/* @three-template
{
	"id": "materials-envmaps-fasthdr",
	"title": "Materials Envmaps FastHDR",
	"description": "A simplified reflective-material scene using a procedural environment map.",
	"rendererKind": "webgl",
	"tags": ["materials", "envmap", "reflection"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#020617" },
		{ "key": "surfaceColor", "label": "Surface color", "control": "color", "defaultValue": "#f8fafc" },
		{ "key": "metalness", "label": "Metalness", "control": "range", "min": 0, "max": 1, "step": 0.05, "defaultValue": 0.85 },
		{ "key": "roughness", "label": "Roughness", "control": "range", "min": 0.02, "max": 0.8, "step": 0.02, "defaultValue": 0.18 }
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
	TorusKnotGeometry
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"metalness": 0.85,
	"roughness": 0.18,
	"surfaceColor": "#f8fafc"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	renderer,
	scene
}): ThreeDemoSceneController => {
	const pmremGenerator = new PMREMGenerator(renderer);
	const reflectiveMaterial = new MeshStandardMaterial({
		color: String(templateParameters.surfaceColor),
		metalness: Number(templateParameters.metalness),
		roughness: Number(templateParameters.roughness)
	});
	const knotGeometry = new TorusKnotGeometry(0.9, 0.24, 160, 24);
	const sphereGeometry = new SphereGeometry(0.48, 32, 24);
	const knot = new Mesh(knotGeometry, reflectiveMaterial);
	const sphere = new Mesh(sphereGeometry, reflectiveMaterial);
	const group = new Group();
	const ambientLight = new AmbientLight('#ffffff', 0.8);
	const directionalLight = new DirectionalLight('#ffffff', 2.4);

	scene.background = new Color(String(templateParameters.background));
	scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.05).texture;
	camera.position.set(0, 0.8, 5);
	directionalLight.position.set(4, 5, 6);

	sphere.position.set(-1.7, -0.2, 0);
	knot.position.set(1.2, 0.2, 0);
	group.add(sphere);
	group.add(knot);

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(group);

	return {
		update: () => {
			group.rotation.y += 0.008;
			group.rotation.x = Math.sin(group.rotation.y * 0.6) * 0.16;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(group);
			scene.environment?.dispose?.();
			knotGeometry.dispose();
			sphereGeometry.dispose();
			reflectiveMaterial.dispose();
			pmremGenerator.dispose();
		}
	};
};
