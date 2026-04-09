/**
 * Purpose: Send browser-side chat requests to the Pi chat endpoints.
 * Context: The chat page keeps optimistic UI state in the browser while Pi stays behind server routes.
 * Responsibility: Call the start-session and send-message endpoints and normalize transport errors.
 * Boundaries: This module does not own UI state, DOM events, or server-side session logic.
 */

import { resolve } from '$app/paths';

import type { PiChatMessageRequest, PiChatSessionPayload } from './chat-types';

async function readTransportError(response: Response, fallbackMessage: string): Promise<Error> {
	const payload = (await response.json().catch(() => null)) as { message?: string } | null;
	return new Error(payload?.message ?? fallbackMessage);
}

export async function startPiChatSessionClient(
	endpoint = resolve('/chat/session')
): Promise<PiChatSessionPayload> {
	const response = await fetch(endpoint, {
		method: 'POST'
	});

	if (!response.ok) {
		throw await readTransportError(response, 'Could not start a Pi session.');
	}

	return (await response.json()) as PiChatSessionPayload;
}

export async function sendPiChatMessageClient(
	prompt: string,
	endpoint = resolve('/chat/messages')
): Promise<PiChatSessionPayload> {
	const requestBody = {
		prompt
	} satisfies PiChatMessageRequest;
	const response = await fetch(endpoint, {
		body: JSON.stringify(requestBody),
		headers: {
			'content-type': 'application/json'
		},
		method: 'POST'
	});

	if (!response.ok) {
		throw await readTransportError(response, 'Could not send the Pi message.');
	}

	return (await response.json()) as PiChatSessionPayload;
}
