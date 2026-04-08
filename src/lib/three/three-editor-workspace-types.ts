/**
 * Purpose: Share the small client-side workspace types used by the editable Three demo surfaces.
 * Context: Both the plain editor demo and the Pi-enhanced editor demo need the same active-file shape.
 * Responsibility: Define serializable workspace context types without pulling in server-only modules.
 * Boundaries: This file contains type definitions only and no runtime behavior.
 */

export type ThreeEditorActiveFileContext = {
	content: string;
	isDirty: boolean;
	path: string;
	savedContent: string;
};
