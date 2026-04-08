/**
 * Purpose: Define the minimal rotating cube scene used by the local Three.js demo viewer.
 * Context: Demo-specific Three scene code lives in `static/three` so it is colocated with future public Three assets.
 * Responsibility: Define only the cube-specific scene objects, animation logic, and resource cleanup.
 * Boundaries: This module does not create the renderer, own resize handling, or know anything about Svelte components.
 */

import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

const AMBIENT_LIGHT_INTENSITY = 2.2;
const CAMERA_Z = 3.5;
const CUBE_COLOR = '#7dd3fc';
const CUBE_INITIAL_ROTATION_X = 0.35;
const CUBE_INITIAL_ROTATION_Y = 0.2;
const CUBE_SIZE = 1.2;
const DIRECTIONAL_LIGHT_INTENSITY = 2.8;
const ROTATION_X_STEP = 0.01;
const ROTATION_Y_STEP = 0.015;
const SCENE_BACKGROUND = '#020617';

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const geometry = new BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
	const material = new MeshStandardMaterial({
		color: CUBE_COLOR,
		metalness: 0.12,
		roughness: 0.35
	});
	const cube = new Mesh(geometry, material);
	const ambientLight = new AmbientLight('#ffffff', AMBIENT_LIGHT_INTENSITY);
	const directionalLight = new DirectionalLight('#ffffff', DIRECTIONAL_LIGHT_INTENSITY);

	scene.background = new Color(SCENE_BACKGROUND);
	camera.position.z = CAMERA_Z;
	directionalLight.position.set(3, 4, 5);
	cube.rotation.x = CUBE_INITIAL_ROTATION_X;
	cube.rotation.y = CUBE_INITIAL_ROTATION_Y;

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(cube);

	return {
		update: () => {
			cube.rotation.x += ROTATION_X_STEP;
			cube.rotation.y += ROTATION_Y_STEP;
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(cube);
			geometry.dispose();
			material.dispose();
		}
	};
};
