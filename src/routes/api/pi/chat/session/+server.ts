/**
 * Purpose: Start a persisted Pi chat session for the browser chat UI.
 * Context: The chat page uses client-side fetch for modern optimistic updates instead of form actions.
 * Responsibility: Validate chat availability, create a managed session, set the session cookie, and return transcript state.
 * Boundaries: UI state and optimistic rendering stay on the client, and Pi SDK setup stays in library modules.
 */

import { json } from '@sveltejs/kit';

import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import { setPiChatSessionCookie } from '$lib/server/pi/chat-cookie';
import { startPiChatSession } from '$lib/server/pi/chat-service';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	if (!hasActiveOpenRouterKey()) {
		return json(
			{
				message: 'Add and activate an OpenRouter key first.'
			},
			{ status: 400 }
		);
	}

	try {
		const session = await startPiChatSession();
		setPiChatSessionCookie(cookies, session.sessionFile);

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
