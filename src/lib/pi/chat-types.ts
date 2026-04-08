/**
 * Purpose: Share the browser-safe transport types for the Pi chat route.
 * Context: The chat page uses JSON endpoints and optimistic local state instead of server form actions.
 * Responsibility: Define request and response payloads without pulling in server-only Pi modules.
 * Boundaries: This file contains transport contracts only and no fetch or Pi SDK behavior.
 */

import type { ConversationMessage } from '$lib/blocks';

export type PiChatConversationMessage = ConversationMessage & {
	id?: string;
	timestamp?: number;
};

export type PiChatMessageRequest = {
	prompt: string;
};

export type PiChatSessionPayload = {
	messages: PiChatConversationMessage[];
	sessionReady: boolean;
};
