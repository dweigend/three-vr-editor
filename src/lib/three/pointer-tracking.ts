/**
 * Purpose: Share normalized pointer tracking for Three.js demos that raycast against scene content.
 * Context: Multiple teaching scenes convert DOM pointer coordinates into normalized device coordinates for raycasters.
 * Responsibility: Bind one pointermove listener, expose the live normalized pointer, and provide cleanup.
 * Boundaries: This helper does not create raycasters, interpret hits, or own any scene state.
 */

import { Vector2 } from 'three';

export type PointerTracker = {
	dispose: () => void;
	pointer: Vector2;
};

export function bindPointerTracking(container: HTMLDivElement): PointerTracker {
	const pointer = new Vector2(0, 0);
	const handlePointerMove = (event: PointerEvent) => {
		const bounds = container.getBoundingClientRect();

		// Raycasters expect normalized device coordinates in the -1 to 1 range.
		pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
	};

	container.addEventListener('pointermove', handlePointerMove);

	return {
		pointer,
		dispose: () => {
			container.removeEventListener('pointermove', handlePointerMove);
		}
	};
}
