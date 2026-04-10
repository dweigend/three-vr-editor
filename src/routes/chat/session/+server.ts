import { json } from '@sveltejs/kit';

import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import { startPiChatSession } from '$lib/server/pi/chat-service';
import { setPiSessionCookie } from '$lib/server/pi/session-cookie';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	if (!hasActiveOpenRouterKey()) {
		return json({ message: 'Add and activate an OpenRouter key first.' }, { status: 400 });
	}

	try {
		const session = await startPiChatSession();
		setPiSessionCookie(cookies, 'chat', session.sessionFile);

		return json({
			messages: session.messages,
			sessionReady: true
		});
	} catch (caughtError) {
		const message =
			caughtError instanceof Error ? caughtError.message : 'Could not start a Pi session.';

		return json({ message }, { status: 400 });
	}
};
