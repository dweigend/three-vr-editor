/**
 * Purpose: Provide a thick wireframe scene inspired by the official fat wireframe example.
 * Context: The template workbench uses this scene to exercise the optional resize hook on a WebGPU-oriented line setup.
 * Responsibility: Render one rotating torus knot wireframe with configurable thickness and color.
 * Boundaries: The scene keeps only the core wireframe idea and omits the larger demo shell.
 */

/* @three-template
{
	"id": "lines-fat-wireframe",
	"title": "Lines Fat Wireframe",
	"description": "A thick wireframe torus knot rendered through the WebGPU preview path.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "lines", "wireframe"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#0f172a" },
		{ "key": "wireColor", "label": "Wire color", "control": "color", "defaultValue": "#c084fc" },
		{ "key": "lineWidth", "label": "Line width", "control": "range", "min": 2, "max": 18, "step": 1, "defaultValue": 6 },
		{ "key": "spinSpeed", "label": "Spin speed", "control": "range", "min": 0.002, "max": 0.02, "step": 0.001, "defaultValue": 0.008 }
	]
}
*/

import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#0f172a",
	"lineWidth": 6,
	"spinSpeed": 0.008,
	"wireColor": "#c084fc"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
	const torusGeometry = new THREE.TorusKnotGeometry(1.1, 0.34, 200, 32);
	const wireGeometry = new WireframeGeometry2(torusGeometry);
	const material = new LineMaterial({
		color: new THREE.Color(String(templateParameters.wireColor)).getHex(),
		linewidth: Number(templateParameters.lineWidth)
	});
	const wireframe = new Wireframe(wireGeometry, material);
	const fill = new THREE.Mesh(
		torusGeometry,
		new THREE.MeshBasicMaterial({
			color: '#0f172a',
			opacity: 0.16,
			transparent: true
		})
	);
	const group = new THREE.Group();

	scene.background = new THREE.Color(String(templateParameters.background));
	camera.position.set(0, 0.4, 5.5);
	group.add(fill);
	group.add(wireframe);
	scene.add(group);

	return {
		update: () => {
			const spinSpeed = Number(templateParameters.spinSpeed);
			group.rotation.x += spinSpeed * 0.7;
			group.rotation.y += spinSpeed;
		},
		resize: ({ height, width }) => {
			material.resolution.set(width, height);
		},
		dispose: () => {
			scene.remove(group);
			torusGeometry.dispose();
			wireGeometry.dispose();
			material.dispose();
			(fill.material as THREE.MeshBasicMaterial).dispose();
		}
	};
};
