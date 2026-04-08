/**
 * Purpose: Power the minimal Pi chat demo with persistent server-side sessions.
 * Context: The page needs one action to start a session and one to continue the dialogue.
 * Responsibility: Load chat state from the session cookie and coordinate the small Pi chat actions.
 * Boundaries: Key management and model configuration live in sibling routes.
 */

import { fail } from '@sveltejs/kit';

import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import { getConfiguredModel } from '$lib/server/pi/models';
import { readPiChatSession, sendPiChatMessage, startPiChatSession } from '$lib/server/pi/session';

import type { Actions, PageServerLoad } from './$types';

const CHAT_SESSION_COOKIE = 'pi_demo_chat_session';

type ChatActionState = {
	status: 'success' | 'error';
	message: string;
	messages?: Awaited<ReturnType<typeof readPiChatSession>>['messages'];
	sessionReady?: boolean;
};

function asString(value: FormDataEntryValue | null): string {
	return typeof value === 'string' ? value : '';
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Unexpected server error.';
}

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionFile = cookies.get(CHAT_SESSION_COOKIE);
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
		cookies.delete(CHAT_SESSION_COOKIE, { path: '/' });

		return {
			hasActiveKey,
			configuredModel,
			sessionReady: false,
			messages: []
		};
	}
};

export const actions: Actions = {
	startSession: async ({ cookies }) => {
		if (!hasActiveOpenRouterKey()) {
			return fail(400, {
				status: 'error',
				message: 'Add and activate an OpenRouter key first.',
				sessionReady: false
			} satisfies ChatActionState);
		}

		try {
			const session = await startPiChatSession();

			cookies.set(CHAT_SESSION_COOKIE, session.sessionFile, {
				httpOnly: true,
				path: '/',
				sameSite: 'lax'
			});

			return {
				status: 'success',
				message: 'New chat session started.',
				messages: session.messages,
				sessionReady: true
			} satisfies ChatActionState;
		} catch (error) {
			return fail(400, {
				status: 'error',
				message: toErrorMessage(error),
				sessionReady: false
			} satisfies ChatActionState);
		}
	},

	sendMessage: async ({ cookies, request }) => {
		const sessionFile = cookies.get(CHAT_SESSION_COOKIE);
		const formData = await request.formData();
		const prompt = asString(formData.get('message')).trim();

		if (!sessionFile) {
			return fail(400, {
				status: 'error',
				message: 'Start a session first.',
				sessionReady: false
			} satisfies ChatActionState);
		}

		if (prompt.length === 0) {
			return fail(400, {
				status: 'error',
				message: 'Message must not be empty.',
				sessionReady: true
			} satisfies ChatActionState);
		}

		try {
			const session = await sendPiChatMessage(sessionFile, prompt);

			return {
				status: 'success',
				message: 'Message sent.',
				messages: session.messages,
				sessionReady: true
			} satisfies ChatActionState;
		} catch (error) {
			cookies.delete(CHAT_SESSION_COOKIE, { path: '/' });

			return fail(400, {
				status: 'error',
				message: toErrorMessage(error),
				sessionReady: false
			} satisfies ChatActionState);
		}
	}
};
