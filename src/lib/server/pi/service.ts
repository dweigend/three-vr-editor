/**
 * Purpose: Validate OpenRouter API keys before they are stored in the demo.
 * Context: The setup page should confirm a key with OpenRouter using the smallest possible server-side check.
 * Responsibility: Call the official OpenRouter API and normalize validation errors.
 * Boundaries: This module does not persist keys or manage Pi chat sessions.
 */

import { looksLikeOpenRouterApiKey } from './auth';

const OPENROUTER_VALIDATE_URL = 'https://openrouter.ai/api/v1/models';

type OpenRouterErrorResponse = {
	error?: {
		message?: string;
	};
};

function getErrorMessage(payload: OpenRouterErrorResponse, status: number): string {
	const message = payload.error?.message?.trim();

	if (message) {
		return message;
	}

	if (status === 401) {
		return 'Key validation failed.';
	}

	return `OpenRouter validation failed with status ${status}.`;
}

export async function validateOpenRouterKey(apiKey: string): Promise<void> {
	const normalizedKey = apiKey.trim();

	if (normalizedKey.length === 0) {
		throw new Error('OpenRouter API key must not be empty.');
	}

	if (!looksLikeOpenRouterApiKey(normalizedKey)) {
		throw new Error('This does not look like an OpenRouter API key.');
	}

	const response = await fetch(OPENROUTER_VALIDATE_URL, {
		headers: {
			Authorization: `Bearer ${normalizedKey}`,
			Accept: 'application/json'
		}
	});

	if (response.ok) {
		return;
	}

	let payload: OpenRouterErrorResponse = {};

	try {
		payload = (await response.json()) as OpenRouterErrorResponse;
	} catch {
		payload = {};
	}

	throw new Error(getErrorMessage(payload, response.status));
}
