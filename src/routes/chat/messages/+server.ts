import { json } from '@sveltejs/kit';

import type { PiChatMessageRequest } from '$lib/features/chat/chat-types';
import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import {
	clearPiSessionCookie,
	getPiSessionCookie,
	setPiSessionCookie
} from '$lib/server/pi/session-cookie';
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

	if (!hasActiveOpenRouterKey()) {
		clearPiSessionCookie(cookies, 'chat');
		return json({ message: 'Add and activate an OpenRouter key first.' }, { status: 400 });
	}

	try {
		const session = await sendPiChatMessage({
			prompt: body.prompt,
			sessionFile: getPiSessionCookie(cookies, 'chat')
		});
		setPiSessionCookie(cookies, 'chat', session.sessionFile);

		return json({
			messages: session.messages,
			sessionReady: true
		});
	} catch (caughtError) {
		clearPiSessionCookie(cookies, 'chat');
		const message =
			caughtError instanceof Error ? caughtError.message : 'Could not send the Pi message.';

		return json({ message }, { status: 400 });
	}
};
