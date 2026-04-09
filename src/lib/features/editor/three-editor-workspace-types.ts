/**
 * Purpose: Share the small client-side workspace types used by the editor surface.
 * Context: The editor page and its Pi panel need the same active-file shape.
 * Responsibility: Define serializable workspace context types without pulling in server-only modules.
 * Boundaries: This file contains type definitions only and no runtime behavior.
 */

export type ThreeEditorActiveFileContext = {
	content: string;
	isDirty: boolean;
	path: string;
	savedContent: string;
};
