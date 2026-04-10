import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import { readPiChatSession } from '$lib/server/pi/chat-service';
import { getConfiguredModel } from '$lib/server/pi/models';
import { clearPiSessionCookie, getPiSessionCookie } from '$lib/server/pi/session-cookie';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionFile = getPiSessionCookie(cookies, 'chat');
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
		clearPiSessionCookie(cookies, 'chat');

		return {
			hasActiveKey,
			configuredModel,
			sessionReady: false,
			messages: []
		};
	}
};
