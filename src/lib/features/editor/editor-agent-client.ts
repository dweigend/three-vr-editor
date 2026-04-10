import type { EditorAgentRequest, EditorAgentResponse } from './editor-agent-types';

export async function sendEditorAgentRequest(
	endpoint: string,
	requestBody: EditorAgentRequest
): Promise<EditorAgentResponse> {
	const response = await fetch(endpoint, {
		body: JSON.stringify(requestBody),
		headers: {
			'content-type': 'application/json'
		},
		method: 'POST'
	});

	if (!response.ok) {
		const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
		throw new Error(errorPayload?.message ?? 'Pi request failed.');
	}

	return (await response.json()) as EditorAgentResponse;
}

export async function clearEditorAgentSession(endpoint: string): Promise<void> {
	const response = await fetch(endpoint, {
		method: 'DELETE'
	});

	if (!response.ok) {
		const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
		throw new Error(errorPayload?.message ?? 'Could not clear the Pi editor session.');
	}
}
