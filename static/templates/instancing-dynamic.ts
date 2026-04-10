import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	InstancedMesh,
	MeshStandardMaterial,
	Object3D,
	type PerspectiveCamera,
	type Scene
} from 'three';

import {
	defineThreeTemplateParameters,
	defineThreeTemplateUi,
	type ThreeDemoSceneFactory
} from '$lib/features/editor/three-helpers';
export const templateUi = defineThreeTemplateUi({
	"id": "instancing-dynamic",
	"title": "Instancing Dynamic",
	"description": "A wave of instanced columns that animate their height over time.",
	"rendererKind": "webgl",
	"tags": ["instancing", "animation", "performance"],
	"parameters": [
		{
			"key": "background",
			"label": "Background",
			"control": "color",
			"defaultValue": "#0f172a"
		},
		{
			"key": "amount",
			"label": "Grid amount",
			"control": "range",
			"min": 8,
			"max": 22,
			"step": 1,
			"defaultValue": 14
		},
		{
			"key": "waveSpeed",
			"label": "Wave speed",
			"control": "range",
			"min": 0.4,
			"max": 3,
			"step": 0.1,
			"defaultValue": 1.4
		},
		{
			"key": "columnColor",
			"label": "Column color",
			"control": "color",
			"defaultValue": "#22d3ee"
		}
	]
});
export const templateParameters = defineThreeTemplateParameters({
	"amount": 14,
	"background": "#0f172a",
	"columnColor": "#22d3ee",
	"waveSpeed": 1.4
});

type InstancingSettings = {
	amount: number;
	background: string;
	columnColor: string;
	waveSpeed: number;
};

type SceneLights = {
	ambientLight: AmbientLight;
	directionalLight: DirectionalLight;
};

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }) => {
	const settings = readInstancingSettings();
	const columnGeometry = new BoxGeometry(0.8, 1, 0.8);
	const columnMaterial = createColumnMaterial(settings.columnColor);
	const columnCount = settings.amount * settings.amount;
	const columnField = new InstancedMesh(
		columnGeometry,
		columnMaterial,
		columnCount
	);
	const placementHelper = new Object3D();
	const sceneLights = createSceneLights();
	let elapsedTime = 0;

	fillColumnField(columnField, placementHelper, settings.amount, 0);
	setupScene(
		camera,
		scene,
		settings.background,
		settings.amount,
		columnField,
		sceneLights
	);

	return {
		update: () => {
			elapsedTime += 0.016 * settings.waveSpeed;
			fillColumnField(
				columnField,
				placementHelper,
				settings.amount,
				elapsedTime
			);
			columnField.instanceMatrix.needsUpdate = true;
			columnField.rotation.y += 0.0025;
		},
		dispose: () => {
			scene.remove(sceneLights.ambientLight);
			scene.remove(sceneLights.directionalLight);
			scene.remove(columnField);
			columnGeometry.dispose();
			columnMaterial.dispose();
		}
	};
};

function readInstancingSettings(): InstancingSettings {
	return {
		amount: Number(templateParameters.amount),
		background: String(templateParameters.background),
		columnColor: String(templateParameters.columnColor),
		waveSpeed: Number(templateParameters.waveSpeed)
	};
}

function createColumnMaterial(columnColor: string): MeshStandardMaterial {
	return new MeshStandardMaterial({
		color: columnColor,
		metalness: 0.18,
		roughness: 0.45
	});
}

function createSceneLights(): SceneLights {
	return {
		ambientLight: new AmbientLight('#ffffff', 1.8),
		directionalLight: new DirectionalLight('#ffffff', 3.2)
	};
}

function fillColumnField(
	columnField: InstancedMesh,
	placementHelper: Object3D,
	amount: number,
	elapsedTime: number
): void {
	let instanceIndex = 0;

	for (let zIndex = 0; zIndex < amount; zIndex += 1) {
		for (let xIndex = 0; xIndex < amount; xIndex += 1) {
			updateColumnTransform(
				placementHelper,
				amount,
				xIndex,
				zIndex,
				elapsedTime
			);
			columnField.setMatrixAt(instanceIndex, placementHelper.matrix);
			instanceIndex += 1;
		}
	}
}

function updateColumnTransform(
	placementHelper: Object3D,
	amount: number,
	xIndex: number,
	zIndex: number,
	elapsedTime: number
): void {
	const wavePhase = xIndex * 0.35 + zIndex * 0.2;
	const columnHeight = 0.6 + Math.abs(Math.sin(elapsedTime + wavePhase)) * 3.4;

	// One helper object builds the transform matrix for each instance.
	placementHelper.position.set(
		xIndex - amount / 2,
		columnHeight * 0.5,
		zIndex - amount / 2
	);
	placementHelper.scale.set(1, columnHeight, 1);
	placementHelper.updateMatrix();
}

function setupScene(
	camera: PerspectiveCamera,
	scene: Scene,
	background: string,
	amount: number,
	columnField: InstancedMesh,
	sceneLights: SceneLights
): void {
	scene.background = new Color(background);
	camera.position.set(amount * 0.45, amount * 0.42, amount * 0.55);
	camera.lookAt(0, 0, 0);
	sceneLights.directionalLight.position.set(
		amount * 0.4,
		amount * 0.7,
		amount * 0.4
	);

	scene.add(sceneLights.ambientLight);
	scene.add(sceneLights.directionalLight);
	scene.add(columnField);
}
