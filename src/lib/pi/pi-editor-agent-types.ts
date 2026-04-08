/**
 * Purpose: Share the transport types for the Three editor Pi agent panel.
 * Context: The client panel and server endpoint need a small stable JSON contract for file-aware requests.
 * Responsibility: Define request, response, and follow-up payload shapes without introducing server imports.
 * Boundaries: This file contains type definitions only and no Pi SDK or UI behavior.
 */

import type { EditorLineRange } from '$lib/editor/editor-diagnostics';
import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';

export type PiEditorAgentPreviousTurn = {
	answer: string;
	prompt: string;
};

export type PiEditorAgentRequest = {
	file: ThreeEditorActiveFileContext;
	previousTurn?: PiEditorAgentPreviousTurn;
	prompt: string;
};

export type PiEditorAgentAppliedEdit = {
	changedLineRanges: EditorLineRange[];
	content: string;
	path: string;
	summary: string;
};

export type PiEditorAgentResponse = {
	answer: string;
	appliedEdit?: PiEditorAgentAppliedEdit;
	modelName?: string;
};
