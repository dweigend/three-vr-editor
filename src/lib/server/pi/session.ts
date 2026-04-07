/**
 * Purpose: Create and continue simple persisted Pi chat sessions for the demo UI.
 * Context: The browser needs a thin chat transport while Pi stays fully server-side.
 * Responsibility: Orchestrate start, read, and prompt flows around the extracted Pi runtime helpers.
 * Boundaries: Runtime setup, transcript mapping, key validation, and model settings live in dedicated modules.
 */

import { SessionManager } from '@mariozechner/pi-coding-agent';

import type { PiChatMessage } from './chat-messages';

import { PI_DEMO_CWD, PI_DEMO_SESSION_DIR } from './paths';
import { getLastPiAssistantError, mapPiChatMessages } from './chat-messages';
import { assertManagedPiSessionFile, createPiDemoAgentSession } from './session-runtime';

type PiChatState = {
	messages: PiChatMessage[];
	sessionFile: string;
};

export async function startPiChatSession(): Promise<PiChatState> {
	const session = await createPiDemoAgentSession(SessionManager.create(PI_DEMO_CWD, PI_DEMO_SESSION_DIR));

	try {
		if (!session.sessionFile) {
			throw new Error('Pi did not create a session file.');
		}

		return {
			sessionFile: session.sessionFile,
			messages: mapPiChatMessages(session.messages)
		};
	} finally {
		session.dispose();
	}
}

export async function readPiChatSession(sessionFile: string): Promise<PiChatState> {
	const normalizedPath = assertManagedPiSessionFile(sessionFile);
	const session = await createPiDemoAgentSession(SessionManager.open(normalizedPath, PI_DEMO_SESSION_DIR, PI_DEMO_CWD));

	try {
		return {
			sessionFile: normalizedPath,
			messages: mapPiChatMessages(session.messages)
		};
	} finally {
		session.dispose();
	}
}

export async function sendPiChatMessage(sessionFile: string, prompt: string): Promise<PiChatState> {
	const normalizedPrompt = prompt.trim();
	const normalizedPath = assertManagedPiSessionFile(sessionFile);

	if (normalizedPrompt.length === 0) {
		throw new Error('Message must not be empty.');
	}

	const session = await createPiDemoAgentSession(SessionManager.open(normalizedPath, PI_DEMO_SESSION_DIR, PI_DEMO_CWD));

	try {
		await session.prompt(normalizedPrompt);
		const assistantError = getLastPiAssistantError(session.messages);

		if (assistantError) {
			throw new Error(assistantError);
		}

		return {
			sessionFile: normalizedPath,
			messages: mapPiChatMessages(session.messages)
		};
	} finally {
		session.dispose();
	}
}
