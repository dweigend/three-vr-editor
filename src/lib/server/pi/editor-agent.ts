/**
 * Purpose: Execute one-shot Pi requests for the Three editor agent panel.
 * Context: The editor-agent demo needs a server-only Pi integration that can return either explanations or structured active-file edits.
 * Responsibility: Build a file-aware prompt, run the specialized Pi session, and return the assistant answer plus any prepared edit.
 * Boundaries: HTTP parsing stays in the route handler, and the browser never imports Pi SDK modules from here.
 */

import type {
	PiEditorAgentAppliedEdit,
	PiEditorAgentPreviousTurn,
	PiEditorAgentRequest,
	PiEditorAgentResponse
} from '$lib/pi/pi-editor-agent-types';

import { getConfiguredModel } from './models';
import { getLastPiAssistantError, mapPiChatMessages } from './chat-messages';
import {
	APPLY_ACTIVE_FILE_EDIT_TOOL_NAME,
	type PiEditorAgentToolDetails
} from './editor-agent-edit-tool';
import { createPiEditorAgentSession } from './editor-agent-session';

export async function runPiEditorAgentRequest(
	request: PiEditorAgentRequest
): Promise<PiEditorAgentResponse> {
	const session = await createPiEditorAgentSession(request.file);
	let appliedEdit: PiEditorAgentAppliedEdit | undefined;
	const unsubscribe = session.subscribe((event) => {
		if (
			event.type !== 'tool_execution_end' ||
			event.toolName !== APPLY_ACTIVE_FILE_EDIT_TOOL_NAME ||
			event.isError
		) {
			return;
		}

		const nextAppliedEdit = toPiEditorAgentAppliedEdit(event.result?.details);

		if (nextAppliedEdit) {
			appliedEdit = nextAppliedEdit;
		}
	});

	try {
		await session.prompt(buildPiEditorAgentPrompt(request));
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
			answer,
			appliedEdit,
			modelName: getConfiguredModel().name
		};
	} finally {
		unsubscribe();
		session.dispose();
	}
}

export function buildPiEditorAgentPrompt(request: PiEditorAgentRequest): string {
	const prompt = request.prompt.trim();
	const fileState = request.file.isDirty ? 'unsaved editor changes present' : 'saved editor state';
	const sections = [
		'Du bist ein pragmatischer Pair-Programming-Agent fuer einen Three.js-/SvelteKit-Editor.',
		'Antworte auf Deutsch, konkret und dateibezogen.',
		'Wenn der Nutzer eine Code-Aenderung, Anpassung oder Umgestaltung verlangt, sollst Du die aktive Datei direkt ueber das bereitgestellte Tool aktualisieren statt nur Chat-Vorschlaege zurueckzugeben.',
		'Wenn der Nutzer nur verstehen oder analysieren moechte, antworte ohne Tool-Nutzung.',
		'Nutze den bereitgestellten Dateisnapshot als autoritative Quelle fuer die aktive Datei.',
		'Wenn Du die aktive Datei aenderst, gib anschliessend nur eine kurze Zusammenfassung aus und keinen Diff fuer den Nutzer.',
		'Wenn Du zusaetzlichen Projektkontext brauchst, darfst Du nur read-only Tools verwenden.',
		`Aktive Datei: ${request.file.path}`,
		`Dateistatus: ${fileState}`,
		formatPreviousTurnSection(request.previousTurn),
		['Aktueller Inhalt der aktiven Datei:', '```ts', request.file.content, '```'].join('\n'),
		['Nutzerfrage:', prompt].join('\n')
	];

	return sections.filter((section) => section.length > 0).join('\n\n');
}

function formatPreviousTurnSection(previousTurn: PiEditorAgentPreviousTurn | undefined): string {
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

export function toPiEditorAgentAppliedEdit(details: unknown): PiEditorAgentAppliedEdit | undefined {
	if (!isPiEditorAgentToolDetails(details)) {
		return undefined;
	}

	return {
		changedLineRanges: details.changedLineRanges,
		content: details.updatedContent,
		path: details.path,
		summary: details.summary
	};
}

function isPiEditorAgentToolDetails(details: unknown): details is PiEditorAgentToolDetails {
	if (!details || typeof details !== 'object') {
		return false;
	}

	const candidate = details as Partial<PiEditorAgentToolDetails>;

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
