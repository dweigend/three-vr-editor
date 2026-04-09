/** Start here if you want to learn raycasting with a friendly little cube field. */

import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Group,
	Mesh,
	MeshStandardMaterial,
	Raycaster,
	type PerspectiveCamera,
	type Scene,
	type Vector2
} from 'three';

import {
	createThreePointerTracker,
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';

// The editor sidebar reads this to build the labels and controls.
export const templateUi = defineThreeTemplateUi({
	"id": "interactive-cubes",
	"title": "Interactive Cubes",
	"description": "A small cube field that highlights the hovered cube.",
	"rendererKind": "webgl",
	"tags": ["interaction", "raycast", "cubes"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#111827"
		},
		{
			"key": "cubeColor",
			"label": "Cube color",
			"control": "color",
			"defaultValue": "#60a5fa"
		},
		{
			"key": "highlightColor",
			"label": "Highlight color",
			"control": "color",
			"defaultValue": "#fbbf24"
		},
		{
			"key": "gridSize",
			"label": "Grid size",
			"control": "range",
			"min": 3,
			"max": 8,
			"step": 1,
			"defaultValue": 5
		}
	]
});

// These are the values students can play with first.
export const templateParameters = defineThreeTemplateParameters({
	"background": "#111827",
	"cubeColor": "#60a5fa",
	"gridSize": 5,
	"highlightColor": "#fbbf24"
});

type InteractiveCubeSettings = {
	background: string;
	cubeColor: string;
	gridSize: number;
	highlightColor: string;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({
	camera,
	container,
	scene
}) => {
	const settings = readInteractiveCubeSettings();
	const cubeGeometry = new BoxGeometry(0.72, 0.72, 0.72);
	const baseMaterial = createBaseMaterial(settings.cubeColor);
	const highlightMaterial = createHighlightMaterial(settings.highlightColor);
	const cubeGroup = new Group();
	const cubeMeshes = createCubeField(
		cubeGroup,
		cubeGeometry,
		baseMaterial,
		settings.gridSize
	);
	const sceneLights = createSceneLights();
	const pointerTracker = createThreePointerTracker(container, {
		idlePointer: { x: 2, y: 2 }
	});
	const raycaster = new Raycaster();
	let hoveredCube: Mesh | null = null;

	setupScene(camera, scene, settings.background, cubeGroup, sceneLights);

	return {
		update: () => {
			cubeGroup.rotation.y += 0.003;
			hoveredCube = updateHoveredCube(
				raycaster,
				pointerTracker.pointer,
				camera,
				cubeMeshes,
				baseMaterial,
				highlightMaterial,
				hoveredCube
			);
		},
		dispose: () => {
			pointerTracker.dispose();
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(cubeGroup);
			cubeGeometry.dispose();
			baseMaterial.dispose();
			highlightMaterial.dispose();
		}
	};
};

function readInteractiveCubeSettings(): InteractiveCubeSettings {
	return {
		background: String(templateParameters.background),
		cubeColor: String(templateParameters.cubeColor),
		gridSize: Number(templateParameters.gridSize),
		highlightColor: String(templateParameters.highlightColor)
	};
}

function createBaseMaterial(cubeColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: cubeColor,
		metalness: 0.1,
		roughness: 0.48
	});
}

function createHighlightMaterial(highlightColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: highlightColor,
		emissive: highlightColor,
		emissiveIntensity: 0.4,
		metalness: 0.08,
		roughness: 0.42
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 1.8),
		directionalLight: new DirectionalLight('#ffffff', 2.9)
	};
}

function createCubeField(
	cubeGroup: Group,
	cubeGeometry: BoxGeometry,
	baseMaterial: MeshStandardMaterial,
	gridSize: number
): Mesh[] {
	const cubeMeshes: Mesh[] = [];

	for (let zIndex = 0; zIndex < gridSize; zIndex += 1) {
		for (let xIndex = 0; xIndex < gridSize; xIndex += 1) {
			const cubeMesh = new Mesh(cubeGeometry, baseMaterial);
			cubeMesh.position.set(
				xIndex - gridSize / 2,
				Math.sin((xIndex + zIndex) * 0.6) * 0.35,
				zIndex - gridSize / 2
			);
			cubeMesh.rotation.y = (xIndex + zIndex) * 0.24;
			cubeMeshes.push(cubeMesh);
			cubeGroup.add(cubeMesh);
		}
	}

	return cubeMeshes;
}

function setupScene(
	camera: PerspectiveCamera,
	scene: Scene,
	background: string,
	cubeGroup: Group,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	camera.position.set(0, 2.6, 5.4);
	camera.lookAt(0, 0, 0);
	sceneLights.directionalLight.position.set(3, 4, 5);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(cubeGroup);
}

function updateHoveredCube(
	raycaster: Raycaster,
	pointer: Vector2,
	camera: PerspectiveCamera,
	cubeMeshes: Mesh[],
	baseMaterial: MeshStandardMaterial,
	highlightMaterial: MeshStandardMaterial,
	previousHoveredCube: Mesh | null
): Mesh | null {
	raycaster.setFromCamera(pointer, camera);
	const nextHoveredObject = raycaster.intersectObjects(cubeMeshes)[0]?.object ?? null;

	if (previousHoveredCube && previousHoveredCube !== nextHoveredObject) {
		previousHoveredCube.material = baseMaterial;
	}

	if (nextHoveredObject instanceof Mesh) {
		nextHoveredObject.material = highlightMaterial;
		return nextHoveredObject;
	}

	return null;
}
