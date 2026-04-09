/**
 * Purpose: Provide a small optimistic conversation state helper for Pi chat surfaces.
 * Context: The standalone chat page and the embedded editor agent both need immediate local turns and pending assistant placeholders.
 * Responsibility: Manage transient client-side messages, pending assistant bubbles, and lightweight error state.
 * Boundaries: This module does not fetch data, call Pi endpoints, or persist server session state.
 */

import type { ConversationMessage } from '$lib/blocks';

function createMessageId(prefix: string): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return `${prefix}-${crypto.randomUUID()}`;
	}

	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createConversationState(initialMessages: ConversationMessage[] = []) {
	let messages = $state<ConversationMessage[]>([...initialMessages]);
	let errorMessage = $state<string | null>(null);

	function setMessages(nextMessages: ConversationMessage[]): void {
		messages = [...nextMessages];
		errorMessage = null;
	}

	function setError(nextError: string | null): void {
		errorMessage = nextError;
	}

	function clearError(): void {
		errorMessage = null;
	}

	function reset(): void {
		messages = [];
		errorMessage = null;
	}

	function beginAssistantTurn(prompt: string): string {
		const assistantId = createMessageId('assistant');

		messages = [
			...messages,
			{
				id: createMessageId('user'),
				role: 'user',
				text: prompt
			},
			{
				id: assistantId,
				role: 'assistant',
				state: 'pending',
				text: ''
			}
		];

		return assistantId;
	}

	function resolveAssistantTurn(assistantId: string, answer: string): void {
		messages = messages.map((message) =>
			message.id === assistantId
				? {
						...message,
						state: undefined,
						text: answer
					}
				: message
		);
		errorMessage = null;
	}

	function failAssistantTurn(assistantId: string, message: string): void {
		messages = messages.map((entry) =>
			entry.id === assistantId
				? {
						...entry,
						state: 'error',
						text: message
					}
				: entry
		);
	}

	return {
		get errorMessage() {
			return errorMessage;
		},
		get messages() {
			return messages;
		},
		beginAssistantTurn,
		clearError,
		failAssistantTurn,
		reset,
		resolveAssistantTurn,
		setError,
		setMessages
	};
}
