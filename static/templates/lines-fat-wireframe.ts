/**
 * Purpose: Teach how a fat wireframe can outline a mesh on the WebGPU path.
 * Context: Students can change the line width and wire color while comparing the filled
 * shape and its screen-space outline.
 * Responsibility: Build the wireframe scene, keep the line material sized to the
 * viewport, animate the group, and clean up all geometry and materials.
 * Boundaries: This template stays focused on the core wireframe idea and omits
 * extra tools.
 */

/* @three-template
{
	"id": "lines-fat-wireframe",
	"title": "Lines Fat Wireframe",
	"description": "A thick wireframe torus knot rendered on the WebGPU path.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "lines", "wireframe"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#0f172a"
		},
		{
			"key": "wireColor",
			"label": "Wire color",
			"control": "color",
			"defaultValue": "#c084fc"
		},
		{
			"key": "lineWidth",
			"label": "Line width",
			"control": "range",
			"min": 2,
			"max": 18,
			"step": 1,
			"defaultValue": 6
		},
		{
			"key": "spinSpeed",
			"label": "Spin speed",
			"control": "range",
			"min": 0.002,
			"max": 0.02,
			"step": 0.001,
			"defaultValue": 0.008
		}
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
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#0f172a",
	"lineWidth": 6,
	"spinSpeed": 0.008,
	"wireColor": "#c084fc"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

type FatWireframeSettings = {
	background: string;
	lineWidth: number;
	spinSpeed: number;
	wireColor: string;
};

type WireframeScene = {
	fillMaterial: THREE.MeshBasicMaterial;
	group: THREE.Group;
	lineMaterial: LineMaterial;
	torusGeometry: THREE.TorusKnotGeometry;
	wireGeometry: WireframeGeometry2;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	scene
}): ThreeDemoSceneController => {
	const settings = readFatWireframeSettings();
	const wireframeScene = createWireframeScene(settings);

	configureScene(camera, scene, settings.background, wireframeScene.group);
	updateLineResolution(
		wireframeScene.lineMaterial,
		container.clientWidth,
		container.clientHeight
	);

	return {
		update: () => {
			spinWireframe(wireframeScene.group, settings.spinSpeed);
		},
		resize: ({ height, width }) => {
			updateLineResolution(wireframeScene.lineMaterial, width, height);
		},
		dispose: () => {
			scene.remove(wireframeScene.group);
			wireframeScene.torusGeometry.dispose();
			wireframeScene.wireGeometry.dispose();
			wireframeScene.lineMaterial.dispose();
			wireframeScene.fillMaterial.dispose();
		}
	};
};

function readFatWireframeSettings(): FatWireframeSettings {
	return {
		background: String(templateParameters.background),
		lineWidth: Number(templateParameters.lineWidth),
		spinSpeed: Number(templateParameters.spinSpeed),
		wireColor: String(templateParameters.wireColor)
	};
}

function createWireframeScene(settings: FatWireframeSettings): WireframeScene {
	const torusGeometry = new THREE.TorusKnotGeometry(1.1, 0.34, 200, 32);
	const wireGeometry = new WireframeGeometry2(torusGeometry);
	const lineMaterial = new LineMaterial({
		color: new THREE.Color(settings.wireColor).getHex(),
		linewidth: settings.lineWidth
	});
	const fillMaterial = new THREE.MeshBasicMaterial({
		color: '#0f172a',
		opacity: 0.16,
		transparent: true
	});
	const fillMesh = new THREE.Mesh(torusGeometry, fillMaterial);
	const wireframe = new Wireframe(wireGeometry, lineMaterial);
	const group = new THREE.Group();

	group.add(fillMesh);
	group.add(wireframe);

	return {
		fillMaterial,
		group,
		lineMaterial,
		torusGeometry,
		wireGeometry
	};
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	background: string,
	group: THREE.Group
): void {
	scene.background = new THREE.Color(background);
	camera.position.set(0, 0.4, 5.5);
	scene.add(group);
}

function spinWireframe(group: THREE.Group, spinSpeed: number): void {
	group.rotation.x += spinSpeed * 0.7;
	group.rotation.y += spinSpeed;
}

function updateLineResolution(
	lineMaterial: LineMaterial,
	width: number,
	height: number
): void {
	// Fat lines are measured in screen space, so they need the current viewport size.
	lineMaterial.resolution.set(width, height);
}
