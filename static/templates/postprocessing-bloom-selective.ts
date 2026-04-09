/** Start here if you want click-to-toggle bloom with WebGPU and TSL. */

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { float, mrt, output, pass, uniform } from 'three/tsl';
import * as THREE from 'three/webgpu';

import {
	createThreePointerTracker,
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';

// The editor sidebar reads this to build the labels and controls.
export const templateUi = defineThreeTemplateUi({
	"id": "postprocessing-bloom-selective",
	"title": "Postprocessing Bloom Selective",
	"description": "A selective bloom scene with click-to-toggle bloom spheres.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "postprocessing", "bloom"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#020617"
		},
		{
			"key": "bloomStrength",
			"label": "Bloom strength",
			"control": "range",
			"min": 0.2,
			"max": 3,
			"step": 0.1,
			"defaultValue": 1.2
		},
		{
			"key": "threshold",
			"label": "Threshold",
			"control": "range",
			"min": 0,
			"max": 1,
			"step": 0.05,
			"defaultValue": 0.35
		},
		{
			"key": "exposure",
			"label": "Exposure",
			"control": "range",
			"min": 0.4,
			"max": 2.4,
			"step": 0.1,
			"defaultValue": 1.1
		}
	]
});

// These are the values students can play with first.
export const templateParameters = defineThreeTemplateParameters({
	"background": "#020617",
	"bloomStrength": 1.2,
	"exposure": 1.1,
	"threshold": 0.35
});

export const demoRendererKind = 'webgpu';

type BloomSettings = {
	background: string;
	bloomStrength: number;
	exposure: number;
	threshold: number;
};

type BloomSphere = THREE.Mesh<
	THREE.IcosahedronGeometry,
	THREE.MeshBasicNodeMaterial
>;

type BloomUniform = {
	value: number;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	renderer,
	scene
}) => {
	const settings = readBloomSettings();
	const webgpuRenderer = renderer as THREE.WebGPURenderer;
	const sphereGeometry = new THREE.IcosahedronGeometry(0.7, 8);
	const orbitControls = new OrbitControls(camera, webgpuRenderer.domElement);
	const pointerTracker = createThreePointerTracker(container, {
		eventName: 'pointerdown',
		idlePointer: { x: 2, y: 2 }
	});
	const raycaster = new THREE.Raycaster();
	const bloomSpheres = createBloomSpheres(scene, sphereGeometry);
	const renderPipeline = createBloomPipeline(
		scene,
		camera,
		webgpuRenderer,
		settings
	);

	setupScene(
		camera,
		scene,
		webgpuRenderer,
		orbitControls,
		settings.background,
		settings.exposure
	);

	return {
		update: () => {
			orbitControls.update();
			spinBloomSpheres(bloomSpheres);
			toggleBloomOnClick(pointerTracker.pointer, raycaster, camera, bloomSpheres);
			pointerTracker.reset();
		},
		render: () => {
			renderPipeline.render();
		},
		dispose: () => {
			pointerTracker.dispose();
			orbitControls.dispose();
			bloomSpheres.forEach((sphere) => {
				scene.remove(sphere);
				sphere.material.dispose();
			});
			sphereGeometry.dispose();
			renderPipeline.dispose?.();
		}
	};
};

function readBloomSettings(): BloomSettings {
	return {
		background: String(templateParameters.background),
		bloomStrength: Number(templateParameters.bloomStrength),
		exposure: Number(templateParameters.exposure),
		threshold: Number(templateParameters.threshold)
	};
}

function setupScene(
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
	renderer: THREE.WebGPURenderer,
	orbitControls: OrbitControls,
	background: string,
	exposure: number
): void {
	scene.background = new THREE.Color(background);
	camera.position.set(0, 0, 10);
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = exposure;
	orbitControls.enableDamping = true;
}

function createBloomSpheres(
	scene: THREE.Scene,
	sphereGeometry: THREE.IcosahedronGeometry
): BloomSphere[] {
	const bloomSpheres: BloomSphere[] = [];
	const sphereCount = 18;

	for (let index = 0; index < sphereCount; index += 1) {
		const bloomSphere = createBloomSphere(index, sphereCount, sphereGeometry);
		scene.add(bloomSphere);
		bloomSpheres.push(bloomSphere);
	}

	return bloomSpheres;
}

function createBloomSphere(
	index: number,
	sphereCount: number,
	sphereGeometry: THREE.IcosahedronGeometry
): BloomSphere {
	const color = new THREE.Color().setHSL(index / sphereCount, 0.76, 0.58);
	const bloomIntensity = uniform(index % 3 === 0 ? 1 : 0);
	const sphereMaterial = new THREE.MeshBasicNodeMaterial({ color });

	sphereMaterial.mrtNode = mrt({ bloomIntensity });

	const bloomSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	const angle = (index / sphereCount) * Math.PI * 2;

	bloomSphere.position.set(
		Math.cos(angle) * 3.2,
		Math.sin(angle) * 2.1,
		Math.sin(angle * 2) * 1.8
	);

	return bloomSphere;
}

function createBloomPipeline(
	scene: THREE.Scene,
	camera: THREE.PerspectiveCamera,
	renderer: THREE.WebGPURenderer,
	settings: BloomSettings
): THREE.RenderPipeline {
	const scenePass = pass(scene, camera);

	// MRT gives us two outputs: the normal color and a bloom mask for bright pixels.
	scenePass.setMRT(
		mrt({
			output,
			bloomIntensity: float(0)
		})
	);

	const colorNode = scenePass.getTextureNode('output');
	const bloomMaskNode = scenePass.getTextureNode('bloomIntensity');
	const bloomPass = bloom(colorNode.mul(bloomMaskNode));

	bloomPass.threshold.value = settings.threshold;
	bloomPass.strength.value = settings.bloomStrength;
	bloomPass.radius.value = 0.5;

	const renderPipeline = new THREE.RenderPipeline(renderer);
	renderPipeline.outputColorTransform = false;
	renderPipeline.outputNode = colorNode.add(bloomPass).renderOutput();

	return renderPipeline;
}

function spinBloomSpheres(bloomSpheres: BloomSphere[]): void {
	for (const bloomSphere of bloomSpheres) {
		bloomSphere.rotation.x += 0.01;
		bloomSphere.rotation.y += 0.016;
	}
}

function toggleBloomOnClick(
	pointer: THREE.Vector2,
	raycaster: THREE.Raycaster,
	camera: THREE.PerspectiveCamera,
	bloomSpheres: BloomSphere[]
): void {
	if (pointer.x > 1 || pointer.y > 1) {
		return;
	}

	raycaster.setFromCamera(pointer, camera);
	const hit = raycaster.intersectObjects(bloomSpheres)[0];

	if (!hit || !(hit.object instanceof THREE.Mesh)) {
		return;
	}

	const bloomUniform = readBloomUniform(hit.object as BloomSphere);

	if (!bloomUniform) {
		return;
	}

	bloomUniform.value = bloomUniform.value === 0 ? 1 : 0;
}

function readBloomUniform(bloomSphere: BloomSphere): BloomUniform | undefined {
	return bloomSphere.material.mrtNode?.get('bloomIntensity') as
		| BloomUniform
		| undefined;
}
