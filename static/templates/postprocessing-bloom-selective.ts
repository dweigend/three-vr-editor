/**
 * Purpose: Teach selective bloom with Three.js WebGPU and TSL.
 * Context: Students can click spheres to toggle bloom and see how a second render target
 * carries bloom information into a post-processing pass.
 * Responsibility: Build the bloom-enabled node materials, configure the post-processing
 * pipeline, react to pointer clicks, and clean up all created resources.
 * Boundaries: This template stays focused on selective bloom and omits inspector
 * features.
 */

/* @three-template
{
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
}
*/

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { float, mrt, output, pass, uniform } from 'three/tsl';
import * as THREE from 'three/webgpu';

import type {
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from '../../src/lib/three/three-demo-scene';

// Try these values first in the editor sidebar.
// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"bloomStrength": 1.2,
	"exposure": 1.1,
	"threshold": 0.35
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

type BloomSceneSettings = {
	background: string;
	bloomStrength: number;
	exposure: number;
	threshold: number;
};

type BloomSphere = THREE.Mesh<
	THREE.IcosahedronGeometry,
	THREE.MeshBasicNodeMaterial
>;

type PointerTracker = {
	dispose: () => void;
	pointer: THREE.Vector2;
};

type BloomPipeline = {
	renderPipeline: THREE.RenderPipeline;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	renderer,
	scene
}): ThreeDemoSceneController => {
	const settings = readBloomSceneSettings();
	const webgpuRenderer = renderer as THREE.WebGPURenderer;
	const sphereGeometry = new THREE.IcosahedronGeometry(0.7, 8);
	const orbitControls = new OrbitControls(camera, webgpuRenderer.domElement);
	const pointerTracker = bindPointerClicks(container);
	const raycaster = new THREE.Raycaster();
	const bloomSpheres = createBloomSpheres(scene, sphereGeometry);
	const bloomPipeline = createBloomPipeline(scene, camera, webgpuRenderer, settings);

	configureScene(
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
			toggleBloomOnClick(
				pointerTracker.pointer,
				raycaster,
				camera,
				bloomSpheres
			);
			pointerTracker.pointer.set(2, 2);
		},
		render: () => {
			bloomPipeline.renderPipeline.render();
		},
		dispose: () => {
			pointerTracker.dispose();
			orbitControls.dispose();
			bloomSpheres.forEach((sphere) => {
				scene.remove(sphere);
				sphere.material.dispose();
			});
			sphereGeometry.dispose();
			bloomPipeline.renderPipeline.dispose?.();
		}
	};
};

function readBloomSceneSettings(): BloomSceneSettings {
	return {
		background: String(templateParameters.background),
		bloomStrength: Number(templateParameters.bloomStrength),
		exposure: Number(templateParameters.exposure),
		threshold: Number(templateParameters.threshold)
	};
}

function configureScene(
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
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

function bindPointerClicks(container: HTMLDivElement): PointerTracker {
	const pointer = new THREE.Vector2(2, 2);
	const handlePointerDown = (event: PointerEvent) => {
		const bounds = container.getBoundingClientRect();

		// Raycasters read positions in normalized device coordinates, not pixels.
		pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
	};

	container.addEventListener('pointerdown', handlePointerDown);

	return {
		pointer,
		dispose: () => {
			container.removeEventListener('pointerdown', handlePointerDown);
		}
	};
}

function createBloomSpheres(
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	sphereGeometry: THREE.IcosahedronGeometry
): BloomSphere[] {
	const bloomSpheres: BloomSphere[] = [];
	const sphereCount = 18;

	for (let index = 0; index < sphereCount; index += 1) {
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
		scene.add(bloomSphere);
		bloomSpheres.push(bloomSphere);
	}

	return bloomSpheres;
}

function createBloomPipeline(
	scene: Parameters<ThreeDemoSceneFactory>[0]['scene'],
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
	renderer: THREE.WebGPURenderer,
	settings: BloomSceneSettings
): BloomPipeline {
	const scenePass = pass(scene, camera);

	scenePass.setMRT(
		mrt({
			output,
			// The second target stores which pixels should contribute to bloom.
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

	return { renderPipeline };
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
	camera: Parameters<ThreeDemoSceneFactory>[0]['camera'],
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

function readBloomUniform(
	bloomSphere: BloomSphere
): { value: number } | undefined {
	return bloomSphere.material.mrtNode?.get('bloomIntensity') as
		| { value: number }
		| undefined;
}
