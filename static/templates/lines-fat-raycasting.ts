/**
 * Purpose: Teach raycasting against a thick line rendered with the WebGPU line helpers.
 * Context: Students can move the pointer over the curve and see the line change color
 * when the raycaster finds a hit.
 * Responsibility: Build the thick line, track pointer input, update hover feedback, and
 * release the geometry and material resources.
 * Boundaries: This scene keeps only the core line interaction and omits extra demo UI.
 */

/* @three-template
{
	"id": "lines-fat-raycasting",
	"title": "Lines Fat Raycasting",
	"description": "A thick curved line that reacts to pointer raycasts.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "lines", "raycast"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#020617"
		},
		{
			"key": "baseColor",
			"label": "Base color",
			"control": "color",
			"defaultValue": "#38bdf8"
		},
		{
			"key": "hitColor",
			"label": "Hit color",
			"control": "color",
			"defaultValue": "#f59e0b"
		},
		{
			"key": "lineWidth",
			"label": "Line width",
			"control": "range",
			"min": 2,
			"max": 20,
			"step": 1,
			"defaultValue": 8
		}
	]
}
*/

import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';
import { bindPointerTracking } from '../../src/lib/three/pointer-tracking';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"baseColor": "#38bdf8",
	"hitColor": "#f59e0b",
	"lineWidth": 8
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

type FatLineSettings = {
	background: string;
	baseColor: string;
	hitColor: string;
	lineWidth: number;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	scene
}): ThreeDemoSceneController => {
	const settings = readFatLineSettings();
	const lineGeometry = new LineGeometry();
	const lineMaterial = createLineMaterial(settings);
	const pointerTracker = bindPointerTracking(container);
	const raycaster = new THREE.Raycaster();

	lineGeometry.setPositions(createLinePoints());

	const fatLine = new Line2(lineGeometry, lineMaterial);
	fatLine.computeLineDistances();

	configureScene(camera, scene, settings.background, fatLine);
	updateLineResolution(lineMaterial, container.clientWidth, container.clientHeight);

	return {
		update: () => {
			fatLine.rotation.y += 0.006;
			updateLineHoverState(
				raycaster,
				pointerTracker.pointer,
				camera,
				fatLine,
				lineMaterial,
				settings
			);
		},
		resize: ({ height, width }) => {
			updateLineResolution(lineMaterial, width, height);
		},
		dispose: () => {
			pointerTracker.dispose();
			scene.remove(fatLine);
			lineGeometry.dispose();
			lineMaterial.dispose();
		}
	};
};

function readFatLineSettings(): FatLineSettings {
	return {
		background: String(templateParameters.background),
		baseColor: String(templateParameters.baseColor),
		hitColor: String(templateParameters.hitColor),
		lineWidth: Number(templateParameters.lineWidth)
	};
}

function createLineMaterial(settings: FatLineSettings): LineMaterial {
	return new LineMaterial({
		color: new THREE.Color(settings.baseColor).getHex(),
		linewidth: settings.lineWidth
	});
}

function createLinePoints(): number[] {
	const points: number[] = [];

	for (let index = 0; index < 40; index += 1) {
		const progress = index / 39;
		const xPosition = (progress - 0.5) * 6;
		const yPosition = Math.sin(progress * Math.PI * 3) * 1.3;
		const zPosition = Math.cos(progress * Math.PI * 2) * 1.1;

		points.push(xPosition, yPosition, zPosition);
	}

	return points;
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	fatLine: Line2
): void {
	scene.background = new THREE.Color(background);
	camera.position.set(0, 0, 8);
	scene.add(fatLine);
}

function updateLineHoverState(
	raycaster: THREE.Raycaster,
	pointer: THREE.Vector2,
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	fatLine: Line2,
	lineMaterial: LineMaterial,
	settings: FatLineSettings
): void {
	raycaster.setFromCamera(pointer, camera);
	const hit = raycaster.intersectObject(fatLine, false)[0];

	lineMaterial.color.set(hit ? settings.hitColor : settings.baseColor);
}

function updateLineResolution(
	lineMaterial: LineMaterial,
	width: number,
	height: number
): void {
	// Fat lines are measured in screen space, so they need the current viewport size.
	lineMaterial.resolution.set(width, height);
}
