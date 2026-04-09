/**
 * Purpose: Provide a thick-line scene inspired by the official fat-line raycasting example.
 * Context: The template workbench uses this file to exercise optional resize hooks and local pointer interaction on the WebGPU path.
 * Responsibility: Render one curved thick line, raycast against it, and switch colors on hover.
 * Boundaries: This scene intentionally omits the original example UI and keeps only the line interaction core.
 */

/* @three-template
{
	"id": "lines-fat-raycasting",
	"title": "Lines Fat Raycasting",
	"description": "A thick curved line that reacts to pointer raycasts.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "lines", "raycast"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#020617" },
		{ "key": "baseColor", "label": "Base color", "control": "color", "defaultValue": "#38bdf8" },
		{ "key": "hitColor", "label": "Hit color", "control": "color", "defaultValue": "#f59e0b" },
		{ "key": "lineWidth", "label": "Line width", "control": "range", "min": 2, "max": 20, "step": 1, "defaultValue": 8 }
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
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"baseColor": "#38bdf8",
	"hitColor": "#f59e0b",
	"lineWidth": 8
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	scene
}): ThreeDemoSceneController => {
	const geometry = new LineGeometry();
	const points: number[] = [];
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2(0, 0);
	const material = new LineMaterial({
		color: new THREE.Color(String(templateParameters.baseColor)).getHex(),
		linewidth: Number(templateParameters.lineWidth)
	});

	for (let index = 0; index < 40; index += 1) {
		const t = index / 39;
		const x = (t - 0.5) * 6;
		const y = Math.sin(t * Math.PI * 3) * 1.3;
		const z = Math.cos(t * Math.PI * 2) * 1.1;
		points.push(x, y, z);
	}

	geometry.setPositions(points);

	const line = new Line2(geometry, material);
	line.computeLineDistances();

	scene.background = new THREE.Color(String(templateParameters.background));
	camera.position.set(0, 0, 8);
	scene.add(line);

	const handlePointerMove = (event: PointerEvent) => {
		const bounds = container.getBoundingClientRect();
		pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
	};

	container.addEventListener('pointermove', handlePointerMove);

	return {
		update: () => {
			line.rotation.y += 0.006;
			raycaster.setFromCamera(pointer, camera);
			const hit = raycaster.intersectObject(line, false)[0];

			material.color.set(hit ? String(templateParameters.hitColor) : String(templateParameters.baseColor));
		},
		resize: ({ height, width }) => {
			material.resolution.set(width, height);
		},
		dispose: () => {
			container.removeEventListener('pointermove', handlePointerMove);
			scene.remove(line);
			geometry.dispose();
			material.dispose();
		}
	};
};
