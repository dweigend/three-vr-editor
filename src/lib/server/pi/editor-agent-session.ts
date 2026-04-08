/**
 * Purpose: Create the specialized Pi session used by the Three editor agent panel.
 * Context: The editor workflow needs a stricter session than the plain chat demo so file changes target the active file by default.
 * Responsibility: Assemble the custom active-file edit tool, resource loader prompts, and in-memory Pi session.
 * Boundaries: Request parsing and response shaping stay in the editor-agent service and route handler.
 */

import { SessionManager } from '@mariozechner/pi-coding-agent';

import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';

import { createPiDemoResourceLoader } from './resource-loader';
import { createConfiguredPiDemoAgentSession } from './session-runtime';
import { createApplyActiveFileEditTool } from './editor-agent-edit-tool';

const EDITOR_AGENT_SYSTEM_PROMPTS = [
	'Wenn der Nutzer eine Aenderung an der aktiven Datei verlangt, arbeite standardmaessig direkt auf dieser Datei statt nur Chat-Anweisungen zu geben.',
	'Verwende fuer aktive Dateiaenderungen das Tool `apply_active_file_edit` und gib danach nur eine kurze Zusammenfassung ohne Diff-Anleitung aus.',
	'Beantworte nur dann rein erklaerend ohne Tool-Nutzung, wenn der Nutzer offensichtlich eine Analyse, Erklaerung oder Rueckfrage moechte.'
];

export async function createEditorAgentSession(activeFileContext: ThreeEditorActiveFileContext) {
	const resourceLoader = await createPiDemoResourceLoader({
		appendSystemPrompts: EDITOR_AGENT_SYSTEM_PROMPTS
	});

	return createConfiguredPiDemoAgentSession({
		customTools: [createApplyActiveFileEditTool(activeFileContext)],
		resourceLoader,
		sessionManager: SessionManager.inMemory()
	});
}
