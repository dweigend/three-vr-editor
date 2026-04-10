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
