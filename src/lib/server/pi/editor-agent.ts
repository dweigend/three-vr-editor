/**
 * Purpose: Execute Pi requests for the Three editor agent panel across one-shot and session modes.
 * Context: The editor surface needs a server-only Pi integration that can return explanations or structured active-file edits.
 * Responsibility: Build a file-aware prompt, run the specialized Pi session, and return the assistant answer plus any prepared edit.
 * Boundaries: HTTP parsing stays in the route handler, and the browser never imports Pi SDK modules from here.
 */

import type {
	EditorAgentMode,
	EditorAgentAppliedEdit,
	EditorAgentPreviousTurn,
	EditorAgentRequest,
	EditorAgentResponse,
	EditorAgentSessionState
} from '$lib/pi/editor-agent-types';
import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';

import { getConfiguredModel } from './models';
import { getLastPiAssistantError, mapPiChatMessages } from './chat-messages';
import {
	APPLY_ACTIVE_FILE_EDIT_TOOL_NAME,
	type EditorAgentToolDetails
} from './editor-agent-edit-tool';
import { createEditorAgentSession } from './editor-agent-session';

export async function runEditorAgentRequest(
	request: EditorAgentRequest,
	options?: {
		sessionFile?: string | null;
	}
): Promise<{ response: EditorAgentResponse; sessionFile?: string }> {
	const isSessionMode = request.mode === 'session';
	const session = await createEditorAgentSession({
		activeFileContext: request.file,
		mode: isSessionMode ? 'persistent' : 'ephemeral',
		sessionFile: isSessionMode ? options?.sessionFile : undefined
	});
	let appliedEdit: EditorAgentAppliedEdit | undefined;
	const unsubscribe = session.subscribe((event) => {
		if (
			event.type !== 'tool_execution_end' ||
			event.toolName !== APPLY_ACTIVE_FILE_EDIT_TOOL_NAME ||
			event.isError
		) {
			return;
		}

		const nextAppliedEdit = toEditorAgentAppliedEdit(event.result?.details);

		if (nextAppliedEdit) {
			appliedEdit = nextAppliedEdit;
		}
	});

	try {
		await session.prompt(buildEditorAgentPrompt(request));
		const assistantError = getLastPiAssistantError(session.messages);

		if (assistantError) {
			throw new Error(assistantError);
		}

		const answer =
			mapPiChatMessages(session.messages)
			.findLast((message) => message.role === 'assistant')
			?.text.trim() ?? appliedEdit?.summary ?? '';

		if (!answer) {
			throw new Error('Pi returned no assistant answer.');
		}

		return {
			response: {
				answer,
				appliedEdit,
				messages: mapPiChatMessages(session.messages),
				modelName: getConfiguredModel().name,
				sessionReady: isSessionMode
			},
			sessionFile: session.sessionFile ?? undefined
		};
	} finally {
		unsubscribe();
		session.dispose();
	}
}

export function buildEditorAgentPrompt(request: EditorAgentRequest): string {
	const prompt = request.prompt.trim();
	const fileState = request.file.isDirty ? 'unsaved editor changes present' : 'saved editor state';
	const sections = [
		'Du bist ein pragmatischer Pair-Programming-Agent fuer einen Three.js-/SvelteKit-Editor.',
		'Antworte auf Deutsch, konkret und dateibezogen.',
		formatModeSection(request.mode),
		'Wenn der Nutzer eine Code-Aenderung, Anpassung oder Umgestaltung verlangt, sollst Du die aktive Datei direkt ueber das bereitgestellte Tool aktualisieren statt nur Chat-Vorschlaege zurueckzugeben.',
		'Wenn der Nutzer nur verstehen oder analysieren moechte, antworte ohne Tool-Nutzung.',
		'Nutze den bereitgestellten Dateisnapshot als autoritative Quelle fuer die aktive Datei.',
		'Wenn Du die aktive Datei aenderst, gib anschliessend nur eine kurze Zusammenfassung aus und keinen Diff fuer den Nutzer.',
		'Wenn Du zusaetzlichen Projektkontext brauchst, darfst Du nur read-only Tools verwenden.',
		`Aktive Datei: ${request.file.path}`,
		`Dateistatus: ${fileState}`,
		request.mode === 'one-shot' ? formatPreviousTurnSection(request.previousTurn) : '',
		['Aktueller Inhalt der aktiven Datei:', '```ts', request.file.content, '```'].join('\n'),
		['Nutzerfrage:', prompt].join('\n')
	];

	return sections.filter((section) => section.length > 0).join('\n\n');
}

export async function readEditorAgentSession(options: {
	activeFileContext: ThreeEditorActiveFileContext;
	sessionFile: string;
}): Promise<EditorAgentSessionState> {
	const session = await createEditorAgentSession({
		activeFileContext: options.activeFileContext,
		mode: 'persistent',
		sessionFile: options.sessionFile
	});

	try {
		return {
			messages: mapPiChatMessages(session.messages),
			modelName: getConfiguredModel().name,
			sessionReady: true
		};
	} finally {
		session.dispose();
	}
}

function formatModeSection(mode: EditorAgentMode): string {
	if (mode === 'session') {
		return 'Sitzungsmodus: fortlaufende Editor-Session. Vorherige Nachrichten sind bereits Teil des aktiven Gespraechsverlaufs.';
	}

	return 'Sitzungsmodus: one-shot ohne serverseitige Persistenz. Nutze fuer Follow-ups nur die mitgelieferte vorherige Runde.';
}

function formatPreviousTurnSection(previousTurn: EditorAgentPreviousTurn | undefined): string {
	if (!previousTurn) {
		return '';
	}

	const previousPrompt = previousTurn.prompt.trim();
	const previousAnswer = previousTurn.answer.trim();

	if (previousPrompt.length === 0 || previousAnswer.length === 0) {
		return '';
	}

	return [
		'Vorherige Runde fuer das aktuelle Follow-up:',
		`Vorherige Nutzerfrage: ${previousPrompt}`,
		'Vorherige Antwort:',
		previousAnswer
	].join('\n');
}

export function toEditorAgentAppliedEdit(details: unknown): EditorAgentAppliedEdit | undefined {
	if (!isEditorAgentToolDetails(details)) {
		return undefined;
	}

	return {
		changedLineRanges: details.changedLineRanges,
		content: details.updatedContent,
		path: details.path,
		summary: details.summary
	};
}

function isEditorAgentToolDetails(details: unknown): details is EditorAgentToolDetails {
	if (!details || typeof details !== 'object') {
		return false;
	}

	const candidate = details as Partial<EditorAgentToolDetails>;

	return (
		typeof candidate.path === 'string' &&
		typeof candidate.summary === 'string' &&
		typeof candidate.updatedContent === 'string' &&
		Array.isArray(candidate.changedLineRanges) &&
		candidate.changedLineRanges.every(
			(range) =>
				typeof range?.startLine === 'number' &&
				typeof range.endLine === 'number' &&
				Number.isInteger(range.startLine) &&
				Number.isInteger(range.endLine)
		)
	);
}
