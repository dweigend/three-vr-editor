/**
 * Purpose: Open and create managed persisted Pi chat sessions for the demo UI.
 * Context: Chat orchestration should not duplicate SessionManager setup or session-file validation.
 * Responsibility: Return ready-to-use Pi sessions plus their managed file paths.
 * Boundaries: This module does not prompt Pi or map messages into browser transcript shapes.
 */

import { SessionManager } from '@mariozechner/pi-coding-agent';

import { PI_DEMO_CWD, PI_DEMO_SESSION_DIR } from './paths';
import { assertManagedPiSessionFile, createPiDemoAgentSession } from './session-runtime';

export async function createManagedPiChatSession() {
	const session = await createPiDemoAgentSession(SessionManager.create(PI_DEMO_CWD, PI_DEMO_SESSION_DIR));

	if (!session.sessionFile) {
		session.dispose();
		throw new Error('Pi did not create a session file.');
	}

	return {
		session,
		sessionFile: session.sessionFile
	};
}

export async function openManagedPiChatSession(sessionFile: string) {
	const normalizedPath = assertManagedPiSessionFile(sessionFile);
	const session = await createPiDemoAgentSession(
		SessionManager.open(normalizedPath, PI_DEMO_SESSION_DIR, PI_DEMO_CWD)
	);

	return {
		session,
		sessionFile: normalizedPath
	};
}
