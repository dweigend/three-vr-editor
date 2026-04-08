/**
 * Purpose: Handle one-shot Pi requests for the Three editor agent panel.
 * Context: The browser posts active-file snapshots here so Pi can answer file-aware questions server-side.
 * Responsibility: Validate the JSON payload, call the Pi editor-agent service, and return a stable JSON response.
 * Boundaries: The route does not create browser UI state or expose Pi SDK objects to the client.
 */

import { error, json } from '@sveltejs/kit';

import type { PiEditorAgentRequest } from '$lib/pi/pi-editor-agent-types';
import { runPiEditorAgentRequest } from '$lib/server/pi/editor-agent';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Partial<PiEditorAgentRequest>;

	if (!isValidPiEditorAgentRequest(body)) {
		throw error(400, 'Invalid Pi editor agent request.');
	}

	try {
		const response = await runPiEditorAgentRequest(body);
		return json(response);
	} catch (caughtError) {
		const message = caughtError instanceof Error ? caughtError.message : 'Pi request failed.';
		return json({ message }, { status: 400 });
	}
};

function isValidPiEditorAgentRequest(body: Partial<PiEditorAgentRequest>): body is PiEditorAgentRequest {
	const file = body.file;
	const previousTurn = body.previousTurn;

	return (
		typeof body.prompt === 'string' &&
		typeof file?.path === 'string' &&
		typeof file.content === 'string' &&
		typeof file.savedContent === 'string' &&
		typeof file.isDirty === 'boolean' &&
		(previousTurn === undefined ||
			(typeof previousTurn.prompt === 'string' && typeof previousTurn.answer === 'string'))
	);
}
