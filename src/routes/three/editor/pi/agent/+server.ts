/**
 * Purpose: Handle Pi requests for the Three editor agent panel across one-shot and session modes.
 * Context: The browser posts active-file snapshots here so Pi can answer file-aware questions server-side.
 * Responsibility: Validate the JSON payload, call the Pi editor service, and return a stable JSON response.
 * Boundaries: The route does not create browser UI state or expose Pi SDK objects to the client.
 */

import { error, json } from '@sveltejs/kit';

import type { EditorAgentRequest } from '$lib/pi/editor-agent-types';
import { runEditorAgentRequest } from '$lib/server/pi/editor-agent';
import { clearPiSessionCookie, getPiSessionCookie, setPiSessionCookie } from '$lib/server/pi/session-cookie';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const body = (await request.json()) as Partial<EditorAgentRequest>;

	if (!isValidEditorAgentRequest(body)) {
		throw error(400, 'Invalid Pi editor agent request.');
	}

	try {
		const result = await runEditorAgentRequest(body, {
			sessionFile: body.mode === 'session' ? getPiSessionCookie(cookies, 'editor') : undefined
		});

		if (body.mode === 'session' && result.sessionFile) {
			setPiSessionCookie(cookies, 'editor', result.sessionFile);
		}

		return json(result.response);
	} catch (caughtError) {
		const message = caughtError instanceof Error ? caughtError.message : 'Pi request failed.';
		return json({ message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	clearPiSessionCookie(cookies, 'editor');
	return json({
		messages: [],
		sessionReady: false
	});
};

function isValidEditorAgentRequest(body: Partial<EditorAgentRequest>): body is EditorAgentRequest {
	const file = body.file;
	const previousTurn = body.previousTurn;

	return (
		typeof body.prompt === 'string' &&
		(body.mode === 'one-shot' || body.mode === 'session') &&
		typeof file?.path === 'string' &&
		typeof file.content === 'string' &&
		typeof file.savedContent === 'string' &&
		typeof file.isDirty === 'boolean' &&
		(previousTurn === undefined ||
			(typeof previousTurn.prompt === 'string' && typeof previousTurn.answer === 'string'))
	);
}
