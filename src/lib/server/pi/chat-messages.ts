/**
 * Purpose: Normalize Pi SDK messages into the small chat transcript used by the demo UI.
 * Context: The chat route only needs user and assistant text plus lightweight error detection.
 * Responsibility: Extract text from Pi messages and expose a stable transcript shape.
 * Boundaries: This module does not create sessions, load prompts, or touch filesystem state.
 */

import type { AssistantMessage, TextContent, UserMessage } from '@mariozechner/pi-ai';
import type { PiChatConversationMessage } from '$lib/pi/chat-types';

type PiMessageLike = {
	role: string;
	timestamp: number;
	content?: unknown;
	stopReason?: string;
	errorMessage?: string;
};

function extractUserText(message: UserMessage): string {
	if (typeof message.content === 'string') {
		return message.content.trim();
	}

	return message.content
		.filter((item): item is TextContent => item.type === 'text')
		.map((item) => item.text.trim())
		.filter((text) => text.length > 0)
		.join('\n\n');
}

function extractAssistantText(message: AssistantMessage): string {
	return message.content
		.filter((item): item is TextContent => item.type === 'text')
		.map((item) => item.text.trim())
		.filter((text) => text.length > 0)
		.join('\n\n');
}

export function mapPiChatMessages(messages: PiMessageLike[]): PiChatConversationMessage[] {
	const transcript: PiChatConversationMessage[] = [];

	for (const message of messages) {
		if (message.role === 'user' && message.content) {
			const text = extractUserText(message as UserMessage);

			if (text) {
				transcript.push({
					id: `user-${message.timestamp}-${transcript.length}`,
					role: 'user',
					text,
					timestamp: message.timestamp
				});
			}
		}

		if (message.role === 'assistant' && message.content) {
			const text = extractAssistantText(message as AssistantMessage);

			if (text) {
				transcript.push({
					id: `assistant-${message.timestamp}-${transcript.length}`,
					role: 'assistant',
					text,
					timestamp: message.timestamp
				});
			}
		}
	}

	return transcript;
}

export function getLastPiAssistantError(messages: PiMessageLike[]): string | null {
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const message = messages[index];

		if (message.role !== 'assistant') {
			continue;
		}

		if (message.stopReason === 'error' || message.stopReason === 'aborted') {
			return message.errorMessage?.trim() || 'Pi returned an assistant error.';
		}

		return null;
	}

	return null;
}
