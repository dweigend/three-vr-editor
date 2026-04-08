/**
 * Purpose: Define the minimal rotating sphere scene used by the local Three.js demo viewer.
 * Context: Demo-specific Three scene code lives in `static/three` so it is colocated with future public Three assets.
 * Responsibility: Define only the sphere-specific scene objects, animation logic, and resource cleanup.
 * Boundaries: This module does not create the renderer, own resize handling, or know anything about Svelte components.
 */

import {
	AmbientLight,
	Color,
	DirectionalLight,
	Group,
	Mesh,
	MeshStandardMaterial,
	PointLight,
	SphereGeometry
} from 'three';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

const AMBIENT_LIGHT_INTENSITY = 2.2;
const CAMERA_Z = 3.5;
const SPHERE_RED_COLOR = '#ff4444';
const SPHERE_BLUE_COLOR = '#4444ff';
const SPHERE_YELLOW_COLOR = '#ffff44';
const SPHERE_SIZE = 0.8;
const SPHERE_DISTANCE = 1.5;
const DIRECTIONAL_LIGHT_INTENSITY = 2.8;
const ORBIT_SPEED = 0.01;
const SCENE_BACKGROUND = '#020617';
const BLINK_SPEED = 2.5;
const RED_PHASE = 0;
const BLUE_PHASE = Math.PI;
const YELLOW_PHASE = (2 * Math.PI) / 3;

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const geometry = new SphereGeometry(SPHERE_SIZE, 32, 32);
	const redMaterial = new MeshStandardMaterial({
		color: SPHERE_RED_COLOR,
		metalness: 0.12,
		roughness: 0.35
	});
	const blueMaterial = new MeshStandardMaterial({
		color: SPHERE_BLUE_COLOR,
		metalness: 0.12,
		roughness: 0.35
	});
	const yellowMaterial = new MeshStandardMaterial({
		color: SPHERE_YELLOW_COLOR,
		metalness: 0.12,
		roughness: 0.35
	});

	const redSphere = new Mesh(geometry, redMaterial);
	const blueSphere = new Mesh(geometry, blueMaterial);
	const yellowSphere = new Mesh(geometry, yellowMaterial);
	const orbitGroup = new Group();

	// Position spheres evenly on a circle
	redSphere.position.x = SPHERE_DISTANCE * Math.cos(0);
	redSphere.position.z = SPHERE_DISTANCE * Math.sin(0);

	blueSphere.position.x = SPHERE_DISTANCE * Math.cos((2 * Math.PI) / 3);
	blueSphere.position.z = SPHERE_DISTANCE * Math.sin((2 * Math.PI) / 3);

	yellowSphere.position.x = SPHERE_DISTANCE * Math.cos((4 * Math.PI) / 3);
	yellowSphere.position.z = SPHERE_DISTANCE * Math.sin((4 * Math.PI) / 3);

	const redLight = new PointLight(SPHERE_RED_COLOR, 1);
	const blueLight = new PointLight(SPHERE_BLUE_COLOR, 1);
	const yellowLight = new PointLight(SPHERE_YELLOW_COLOR, 1);

	redSphere.add(redLight);
	blueSphere.add(blueLight);
	yellowSphere.add(yellowLight);

	orbitGroup.add(redSphere);
	orbitGroup.add(blueSphere);
	orbitGroup.add(yellowSphere);

	const ambientLight = new AmbientLight('#ffffff', AMBIENT_LIGHT_INTENSITY);
	const directionalLight = new DirectionalLight('#ffffff', DIRECTIONAL_LIGHT_INTENSITY);

	scene.background = new Color(SCENE_BACKGROUND);
	camera.position.z = CAMERA_Z;
	directionalLight.position.set(3, 4, 5);

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(orbitGroup);

	let time = 0;

	return {
		update: () => {
			orbitGroup.rotation.y += ORBIT_SPEED;

			time += 0.016; // roughly 60 FPS delta
			redLight.intensity = 0.5 + 0.5 * Math.sin(time * BLINK_SPEED + RED_PHASE);
			blueLight.intensity = 0.5 + 0.5 * Math.sin(time * BLINK_SPEED + BLUE_PHASE);
			yellowLight.intensity = 0.5 + 0.5 * Math.sin(time * BLINK_SPEED + YELLOW_PHASE);
		},
		dispose: () => {
			scene.remove(ambientLight);
			scene.remove(directionalLight);
			scene.remove(orbitGroup);
			geometry.dispose();
			redMaterial.dispose();
			blueMaterial.dispose();
			yellowMaterial.dispose();
			// PointLight has no dispose method, removal handled by orbitGroup removal
		}
	};
};