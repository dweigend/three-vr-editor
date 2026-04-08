/**
 * Purpose: Load the persisted Pi chat state for the chat page.
 * Context: The browser chat UI handles optimistic submission through JSON endpoints, while SSR only hydrates the initial session transcript.
 * Responsibility: Read the managed chat cookie, resolve the current transcript, and expose model and key state to the page.
 * Boundaries: Start and send operations live in dedicated API routes and shared Pi server modules.
 */

import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import { clearPiChatSessionCookie, getPiChatSessionCookie } from '$lib/server/pi/chat-cookie';
import { readPiChatSession } from '$lib/server/pi/chat-service';
import { getConfiguredModel } from '$lib/server/pi/models';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionFile = getPiChatSessionCookie(cookies);
	const hasActiveKey = hasActiveOpenRouterKey();
	const configuredModel = getConfiguredModel();

	if (!sessionFile || !hasActiveKey) {
		return {
			hasActiveKey,
			configuredModel,
			sessionReady: false,
			messages: []
		};
	}

	try {
		const session = await readPiChatSession(sessionFile);

		return {
			hasActiveKey,
			configuredModel,
			sessionReady: true,
			messages: session.messages
		};
	} catch {
		clearPiChatSessionCookie(cookies);

		return {
			hasActiveKey,
			configuredModel,
			sessionReady: false,
			messages: []
		};
	}
};
