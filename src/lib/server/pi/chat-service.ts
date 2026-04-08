/**
 * Purpose: Orchestrate persisted Pi chat sessions for the standalone chat UI.
 * Context: The chat route needs simple start, read, and send operations built on the shared Pi runtime helpers.
 * Responsibility: Validate prompts, open or create managed sessions, run Pi prompts, and map transcript output.
 * Boundaries: Cookie handling stays in route code and low-level session creation stays in dedicated session modules.
 */

import type { PiChatConversationMessage } from '$lib/pi/chat-types';

import { getLastPiAssistantError, mapPiChatMessages } from './chat-messages';
import { createManagedPiChatSession, openManagedPiChatSession } from './chat-session-store';

export type PiChatState = {
	messages: PiChatConversationMessage[];
	sessionFile: string;
};

type SendPiChatMessageOptions = {
	prompt: string;
	sessionFile?: string | null;
};

export async function startPiChatSession(): Promise<PiChatState> {
	const managedSession = await createManagedPiChatSession();

	try {
		return {
			sessionFile: managedSession.sessionFile,
			messages: mapPiChatMessages(managedSession.session.messages)
		};
	} finally {
		managedSession.session.dispose();
	}
}

export async function readPiChatSession(sessionFile: string): Promise<PiChatState> {
	const managedSession = await openManagedPiChatSession(sessionFile);

	try {
		return {
			sessionFile: managedSession.sessionFile,
			messages: mapPiChatMessages(managedSession.session.messages)
		};
	} finally {
		managedSession.session.dispose();
	}
}

export async function sendPiChatMessage(
	options: SendPiChatMessageOptions
): Promise<PiChatState> {
	const normalizedPrompt = options.prompt.trim();

	if (normalizedPrompt.length === 0) {
		throw new Error('Message must not be empty.');
	}

	const managedSession = options.sessionFile
		? await openManagedPiChatSession(options.sessionFile)
		: await createManagedPiChatSession();

	try {
		await managedSession.session.prompt(normalizedPrompt);
		const assistantError = getLastPiAssistantError(managedSession.session.messages);

		if (assistantError) {
			throw new Error(assistantError);
		}

		return {
			sessionFile: managedSession.sessionFile,
			messages: mapPiChatMessages(managedSession.session.messages)
		};
	} finally {
		managedSession.session.dispose();
	}
}
