/**
 * Purpose: Power the OpenRouter key management page for the Pi demo.
 * Context: This route lets users validate, store, activate, and remove multiple keys.
 * Responsibility: Load masked key summaries and handle the small key management actions.
 * Boundaries: Pi chat sessions and model settings live on dedicated routes.
 */

import { fail } from '@sveltejs/kit';

import {
	activateStoredOpenRouterKey,
	hasActiveOpenRouterKey,
	listStoredOpenRouterKeys,
	removeStoredOpenRouterKey,
	saveValidatedOpenRouterKey
} from '$lib/server/pi/auth';
import { validateOpenRouterKey } from '$lib/server/pi/service';

import type { Actions, PageServerLoad } from './$types';

type FormState = {
	status: 'success' | 'error';
	message: string;
	keys: ReturnType<typeof listStoredOpenRouterKeys>;
};

function asString(value: FormDataEntryValue | null): string {
	return typeof value === 'string' ? value : '';
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Unexpected server error.';
}

export const load: PageServerLoad = async () => {
	return {
		hasActiveKey: hasActiveOpenRouterKey(),
		keys: listStoredOpenRouterKeys()
	};
};

export const actions: Actions = {
	addKey: async ({ request }) => {
		const formData = await request.formData();
		const apiKey = asString(formData.get('apiKey')).trim();

		if (apiKey.length === 0) {
			return fail(400, {
				status: 'error',
				message: 'OpenRouter API key must not be empty.',
				keys: listStoredOpenRouterKeys()
			} satisfies FormState);
		}

		try {
			await validateOpenRouterKey(apiKey);
			saveValidatedOpenRouterKey(apiKey);

			return {
				status: 'success',
				message: 'Key validated and stored.',
				keys: listStoredOpenRouterKeys()
			} satisfies FormState;
		} catch (error) {
			return fail(400, {
				status: 'error',
				message: toErrorMessage(error),
				keys: listStoredOpenRouterKeys()
			} satisfies FormState);
		}
	},

	activateKey: async ({ request }) => {
		const formData = await request.formData();
		const keyId = asString(formData.get('keyId')).trim();

		if (keyId.length === 0) {
			return fail(400, {
				status: 'error',
				message: 'Stored key id is missing.',
				keys: listStoredOpenRouterKeys()
			} satisfies FormState);
		}

		try {
			activateStoredOpenRouterKey(keyId);

			return {
				status: 'success',
				message: 'Stored key activated.',
				keys: listStoredOpenRouterKeys()
			} satisfies FormState;
		} catch (error) {
			return fail(400, {
				status: 'error',
				message: toErrorMessage(error),
				keys: listStoredOpenRouterKeys()
			} satisfies FormState);
		}
	},

	deleteKey: async ({ request }) => {
		const formData = await request.formData();
		const keyId = asString(formData.get('keyId')).trim();

		if (keyId.length === 0) {
			return fail(400, {
				status: 'error',
				message: 'Stored key id is missing.',
				keys: listStoredOpenRouterKeys()
			} satisfies FormState);
		}

		try {
			removeStoredOpenRouterKey(keyId);

			return {
				status: 'success',
				message: 'Stored key removed.',
				keys: listStoredOpenRouterKeys()
			} satisfies FormState;
		} catch (error) {
			return fail(400, {
				status: 'error',
				message: toErrorMessage(error),
				keys: listStoredOpenRouterKeys()
			} satisfies FormState);
		}
	}
};
