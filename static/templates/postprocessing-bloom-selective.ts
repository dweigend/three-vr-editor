/**
 * Purpose: Provide a compact selective bloom scene inspired by the official WebGPU bloom example.
 * Context: The template workbench uses this file to exercise the optional custom render hook on the additive WebGPU runtime path.
 * Responsibility: Create bloom-enabled node materials, build a small post-processing pipeline, and toggle bloom targets with pointer input.
 * Boundaries: This simplified version keeps only the selective-bloom core and omits inspector tooling.
 */

/* @three-template
{
	"id": "postprocessing-bloom-selective",
	"title": "Postprocessing Bloom Selective",
	"description": "A selective bloom scene with click-to-toggle bloom spheres.",
	"rendererKind": "webgpu",
	"tags": ["webgpu", "postprocessing", "bloom"],
	"parameters": [
		{ "key": "background", "label": "Background", "control": "color", "defaultValue": "#020617" },
		{ "key": "bloomStrength", "label": "Bloom strength", "control": "range", "min": 0.2, "max": 3, "step": 0.1, "defaultValue": 1.2 },
		{ "key": "threshold", "label": "Threshold", "control": "range", "min": 0, "max": 1, "step": 0.05, "defaultValue": 0.35 },
		{ "key": "exposure", "label": "Exposure", "control": "range", "min": 0.4, "max": 2.4, "step": 0.1, "defaultValue": 1.1 }
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
} from '../../../src/lib/three/three-demo-scene';

// @three-template-parameters:start
export const templateParameters = {
	"background": "#020617",
	"bloomStrength": 1.2,
	"exposure": 1.1,
	"threshold": 0.35
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const demoRendererKind = 'webgpu';

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	renderer,
	scene
}): ThreeDemoSceneController => {
	const webgpuRenderer = renderer as THREE.WebGPURenderer;
	const geometry = new THREE.IcosahedronGeometry(0.7, 8);
	const controls = new OrbitControls(camera, webgpuRenderer.domElement);
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2(0, 0);
	const spheres: THREE.Mesh[] = [];
	const scenePass = pass(scene, camera);
	const renderPipeline = new THREE.RenderPipeline(webgpuRenderer);

	scene.background = new THREE.Color(String(templateParameters.background));
	camera.position.set(0, 0, 10);
	webgpuRenderer.toneMapping = THREE.NeutralToneMapping;
	webgpuRenderer.toneMappingExposure = Number(templateParameters.exposure);
	controls.enableDamping = true;

	for (let index = 0; index < 18; index += 1) {
		const color = new THREE.Color().setHSL(index / 18, 0.76, 0.58);
		const bloomIntensity = uniform(index % 3 === 0 ? 1 : 0);
		const material = new THREE.MeshBasicNodeMaterial({ color });
		material.mrtNode = mrt({
			bloomIntensity
		});

		const sphere = new THREE.Mesh(geometry, material);
		const angle = (index / 18) * Math.PI * 2;

		sphere.position.set(Math.cos(angle) * 3.2, Math.sin(angle) * 2.1, Math.sin(angle * 2) * 1.8);
		scene.add(sphere);
		spheres.push(sphere);
	}

	scenePass.setMRT(
		mrt({
			output,
			bloomIntensity: float(0)
		})
	);

	const colorNode = scenePass.getTextureNode();
	const bloomMaskNode = scenePass.getTextureNode('bloomIntensity');
	const bloomPass = bloom(colorNode.mul(bloomMaskNode));
	bloomPass.threshold.value = Number(templateParameters.threshold);
	bloomPass.strength.value = Number(templateParameters.bloomStrength);
	bloomPass.radius.value = 0.5;
	renderPipeline.outputColorTransform = false;
	renderPipeline.outputNode = colorNode.add(bloomPass).renderOutput();

	const handlePointerDown = (event: PointerEvent) => {
		const bounds = container.getBoundingClientRect();
		pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
		raycaster.setFromCamera(pointer, camera);

		const hit = raycaster.intersectObjects(spheres)[0];

		if (!hit) {
			return;
		}

		const bloomUniform = (hit.object.material as THREE.MeshBasicNodeMaterial).mrtNode?.get('bloomIntensity');

		if (bloomUniform) {
			bloomUniform.value = bloomUniform.value === 0 ? 1 : 0;
		}
	};

	container.addEventListener('pointerdown', handlePointerDown);

	return {
		update: () => {
			controls.update();
			for (const sphere of spheres) {
				sphere.rotation.x += 0.01;
				sphere.rotation.y += 0.016;
			}
		},
		render: () => {
			renderPipeline.render();
		},
		dispose: () => {
			container.removeEventListener('pointerdown', handlePointerDown);
			controls.dispose();
			spheres.forEach((sphere) => {
				scene.remove(sphere);
				(sphere.material as THREE.MeshBasicNodeMaterial).dispose();
			});
			geometry.dispose();
			renderPipeline.dispose?.();
		}
	};
};
