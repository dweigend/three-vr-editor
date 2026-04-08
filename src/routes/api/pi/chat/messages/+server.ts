/**
 * Purpose: Send one prompt turn to the persisted Pi chat session.
 * Context: The browser chat UI needs a JSON endpoint that supports immediate optimistic local updates.
 * Responsibility: Validate the request payload, create or continue the managed chat session, and return the updated transcript.
 * Boundaries: Cookie storage stays delegated to helpers and Pi runtime setup stays in server library modules.
 */

import { json } from '@sveltejs/kit';

import type { PiChatMessageRequest } from '$lib/pi/chat-types';
import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import {
	clearPiChatSessionCookie,
	getPiChatSessionCookie,
	setPiChatSessionCookie
} from '$lib/server/pi/chat-cookie';
import { sendPiChatMessage } from '$lib/server/pi/chat-service';

import type { RequestHandler } from './$types';

function isValidChatRequest(body: Partial<PiChatMessageRequest>): body is PiChatMessageRequest {
	return typeof body.prompt === 'string';
}

export const POST: RequestHandler = async ({ cookies, request }) => {
	const body = (await request.json().catch(() => null)) as Partial<PiChatMessageRequest> | null;

	if (!body || !isValidChatRequest(body)) {
		return json({ message: 'Invalid chat message request.' }, { status: 400 });
	}

	const prompt = body.prompt;

	if (!hasActiveOpenRouterKey()) {
		clearPiChatSessionCookie(cookies);
		return json(
			{
				message: 'Add and activate an OpenRouter key first.'
			},
			{ status: 400 }
		);
	}

	try {
		const session = await sendPiChatMessage({
			prompt,
			sessionFile: getPiChatSessionCookie(cookies)
		});
		setPiChatSessionCookie(cookies, session.sessionFile);

		return json({
			messages: session.messages,
			sessionReady: true
		});
	} catch (caughtError) {
		clearPiChatSessionCookie(cookies);
		const message =
			caughtError instanceof Error ? caughtError.message : 'Could not send the Pi message.';

		return json({ message }, { status: 400 });
	}
};
