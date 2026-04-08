/**
 * Purpose: Handle one-shot Pi requests for the Three editor agent panel.
 * Context: The browser posts active-file snapshots here so Pi can answer file-aware questions server-side.
 * Responsibility: Validate the JSON payload, call the Pi editor-agent service, and return a stable JSON response.
 * Boundaries: The route does not create browser UI state or expose Pi SDK objects to the client.
 */

import { error, json } from '@sveltejs/kit';

import type { EditorAgentRequest } from '$lib/pi/editor-agent-types';
import { runEditorAgentRequest } from '$lib/server/pi/editor-agent';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Partial<EditorAgentRequest>;

	if (!isValidEditorAgentRequest(body)) {
		throw error(400, 'Invalid Pi editor agent request.');
	}

	try {
		const response = await runEditorAgentRequest(body);
		return json(response);
	} catch (caughtError) {
		const message = caughtError instanceof Error ? caughtError.message : 'Pi request failed.';
		return json({ message }, { status: 400 });
	}
};

function isValidEditorAgentRequest(body: Partial<EditorAgentRequest>): body is EditorAgentRequest {
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
