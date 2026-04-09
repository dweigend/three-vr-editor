/**
 * Purpose: Orchestrate persisted Pi chat sessions for the standalone chat UI.
 * Context: The chat route keeps its own persistent scope while reusing the shared Pi runtime helpers.
 * Responsibility: Validate prompts, open or create managed chat sessions, run Pi prompts, and map transcript output.
 * Boundaries: Cookie handling stays in route code and low-level session creation stays in dedicated session modules.
 */

import type { PiChatConversationMessage } from '$lib/features/chat/chat-types';

import { createConfiguredPiAgentSession } from './session-runtime';
import { getLastPiAssistantError, mapPiChatMessages } from './chat-messages';

export type PiChatState = {
	messages: PiChatConversationMessage[];
	sessionFile: string;
};

type SendPiChatMessageOptions = {
	prompt: string;
	sessionFile?: string | null;
};

async function createChatSession(sessionFile?: string | null) {
	const session = await createConfiguredPiAgentSession({
		mode: 'persistent',
		scope: 'chat',
		sessionFile
	});

	if (!session.sessionFile) {
		session.dispose();
		throw new Error('Pi did not create a session file.');
	}

	return session;
}

export async function startPiChatSession(): Promise<PiChatState> {
	const session = await createChatSession();

	try {
		return {
			sessionFile: session.sessionFile!,
			messages: mapPiChatMessages(session.messages)
		};
	} finally {
		session.dispose();
	}
}

export async function readPiChatSession(sessionFile: string): Promise<PiChatState> {
	const session = await createChatSession(sessionFile);

	try {
		return {
			sessionFile: session.sessionFile!,
			messages: mapPiChatMessages(session.messages)
		};
	} finally {
		session.dispose();
	}
}

export async function sendPiChatMessage(
	options: SendPiChatMessageOptions
): Promise<PiChatState> {
	const normalizedPrompt = options.prompt.trim();

	if (normalizedPrompt.length === 0) {
		throw new Error('Message must not be empty.');
	}

	const session = await createChatSession(options.sessionFile);

	try {
		await session.prompt(normalizedPrompt);
		const assistantError = getLastPiAssistantError(session.messages);

		if (assistantError) {
			throw new Error(assistantError);
		}

		return {
			sessionFile: session.sessionFile!,
			messages: mapPiChatMessages(session.messages)
		};
	} finally {
		session.dispose();
	}
}
