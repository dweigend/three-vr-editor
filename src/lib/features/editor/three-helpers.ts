import { Vector2 } from 'three';

import type {
	ThreeTemplateParameterMap,
	ThreeTemplateUi
} from './three-template-types';

export type {
	ThreeDemoRendererKind,
	ThreeCompatibleRenderer,
	ThreeDemoSceneContext,
	ThreeDemoSceneController,
	ThreeDemoSceneFactory
} from './three-demo-scene';

export type ThreePointerTracker = {
	dispose: () => void;
	pointer: Vector2;
	reset: () => void;
};

export type ThreePointerTrackerOptions = {
	eventName?: 'pointerdown' | 'pointermove';
	idlePointer?: {
		x: number;
		y: number;
	};
};

export function defineThreeTemplateUi(templateUi: ThreeTemplateUi): ThreeTemplateUi {
	return templateUi;
}

export function defineThreeTemplateParameters<TParameters extends ThreeTemplateParameterMap>(
	templateParameters: TParameters
): TParameters {
	return templateParameters;
}

export function createThreePointerTracker(
	container: HTMLDivElement,
	options?: ThreePointerTrackerOptions
): ThreePointerTracker {
	const idlePointer = options?.idlePointer ?? { x: 0, y: 0 };
	const eventName = options?.eventName ?? 'pointermove';
	const pointer = new Vector2(idlePointer.x, idlePointer.y);
	const handlePointerEvent = (event: PointerEvent) => {
		const bounds = container.getBoundingClientRect();

		// Raycasters work with normalized device coordinates, not pixel values.
		pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
	};

	container.addEventListener(eventName, handlePointerEvent);

	return {
		pointer,
		dispose: () => {
			container.removeEventListener(eventName, handlePointerEvent);
		},
		reset: () => {
			pointer.set(idlePointer.x, idlePointer.y);
		}
	};
}
