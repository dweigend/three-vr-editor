/** Start here if you want a mesh outline that stays thick on screen. */

import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import * as THREE from 'three/webgpu';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';

// The editor sidebar reads this to build the labels and controls.
export const templateUi = defineThreeTemplateUi({
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
});

// These are the values students can play with first.
export const templateParameters = defineThreeTemplateParameters({
	"background": "#0f172a",
	"lineWidth": 6,
	"spinSpeed": 0.008,
	"wireColor": "#c084fc"
});

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
}) => {
	const settings = readFatWireframeSettings();
	const wireframeScene = createWireframeScene(settings);

	setupScene(camera, scene, settings.background, wireframeScene.group);
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

function setupScene(
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
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
	// Fat lines use screen-space widths, so the current viewport size matters.
	lineMaterial.resolution.set(width, height);
}
