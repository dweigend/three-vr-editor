import type { ThreeEditorActiveFileContext } from '$lib/features/editor/three-editor-workspace-types';

import { createPiResourceLoader } from './resource-loader';
import { createConfiguredPiAgentSession, type PiSessionMode } from './session-runtime';
import { createApplyActiveFileEditTool } from './editor-agent-edit-tool';

const EDITOR_AGENT_SYSTEM_PROMPTS = [
	'Wenn der Nutzer eine Aenderung an der aktiven Datei verlangt, arbeite standardmaessig direkt auf dieser Datei statt nur Chat-Anweisungen zu geben.',
	'Verwende fuer aktive Dateiaenderungen das Tool `apply_active_file_edit` und gib danach nur eine kurze Zusammenfassung ohne Diff-Anleitung aus.',
	'Beantworte nur dann rein erklaerend ohne Tool-Nutzung, wenn der Nutzer offensichtlich eine Analyse, Erklaerung oder Rueckfrage moechte.'
];

export async function createEditorAgentSession(options: {
	activeFileContext: ThreeEditorActiveFileContext;
	mode: PiSessionMode;
	sessionFile?: string | null;
}) {
	const resourceLoader = await createPiResourceLoader({
		appendSystemPrompts: EDITOR_AGENT_SYSTEM_PROMPTS
	});

	return createConfiguredPiAgentSession({
		customTools: [createApplyActiveFileEditTool(options.activeFileContext)],
		mode: options.mode,
		resourceLoader,
		scope: 'editor',
		sessionFile: options.sessionFile
	});
}
