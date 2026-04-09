/**
 * Purpose: Share the transport types for the Three editor Pi agent panel.
 * Context: The client panel and server endpoint need a small stable JSON contract for file-aware requests.
 * Responsibility: Define request, response, and follow-up payload shapes without introducing server imports.
 * Boundaries: This file contains type definitions only and no Pi SDK or UI behavior.
 */

import type { EditorLineRange } from '$lib/features/editor/editor-diagnostics';
import type { PiChatConversationMessage } from '$lib/features/chat/chat-types';
import type { ThreeEditorActiveFileContext } from '$lib/features/editor/three-editor-workspace-types';

export type EditorAgentMode = 'one-shot' | 'session';

export type EditorAgentPreviousTurn = {
	answer: string;
	prompt: string;
};

export type EditorAgentRequest = {
	file: ThreeEditorActiveFileContext;
	mode: EditorAgentMode;
	previousTurn?: EditorAgentPreviousTurn;
	prompt: string;
};

export type EditorAgentAppliedEdit = {
	changedLineRanges: EditorLineRange[];
	content: string;
	path: string;
	summary: string;
};

export type EditorAgentResponse = {
	answer: string;
	appliedEdit?: EditorAgentAppliedEdit;
	messages: PiChatConversationMessage[];
	modelName?: string;
	sessionReady: boolean;
};

export type EditorAgentSessionState = Pick<
	EditorAgentResponse,
	'messages' | 'modelName' | 'sessionReady'
>;
