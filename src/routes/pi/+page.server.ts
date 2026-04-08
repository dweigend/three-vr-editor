/**
 * Purpose: Power the consolidated Pi settings page.
 * Context: This route now combines OpenRouter key management and model selection in one place.
 * Responsibility: Load masked key summaries, model metadata, and handle the small settings actions.
 * Boundaries: Pi chat sessions still live on the dedicated chat route.
 */

import { fail } from '@sveltejs/kit';

import {
	activateStoredOpenRouterKey,
	hasActiveOpenRouterKey,
	listStoredOpenRouterKeys,
	removeStoredOpenRouterKey,
	saveValidatedOpenRouterKey
} from '$lib/server/pi/auth';
import { getConfiguredModelId, PI_DEMO_MODELS, setConfiguredModel } from '$lib/server/pi/models';
import { validateOpenRouterKey } from '$lib/server/pi/service';

import type { Actions, PageServerLoad } from './$types';

type FormState = {
	keys: ReturnType<typeof listStoredOpenRouterKeys>;
	message: string;
	selectedModelId: string;
	status: 'success' | 'error';
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
		keys: listStoredOpenRouterKeys(),
		models: PI_DEMO_MODELS,
		selectedModelId: getConfiguredModelId()
	};
};

export const actions: Actions = {
	addKey: async ({ request }) => {
		const formData = await request.formData();
		const apiKey = asString(formData.get('apiKey')).trim();

		if (apiKey.length === 0) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: 'OpenRouter API key must not be empty.',
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}

		try {
			await validateOpenRouterKey(apiKey);
			saveValidatedOpenRouterKey(apiKey);

			return {
				keys: listStoredOpenRouterKeys(),
				status: 'success',
				message: 'Key validated and stored.',
				selectedModelId: getConfiguredModelId()
			} satisfies FormState;
		} catch (error) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: toErrorMessage(error),
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}
	},

	activateKey: async ({ request }) => {
		const formData = await request.formData();
		const keyId = asString(formData.get('keyId')).trim();

		if (keyId.length === 0) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: 'Stored key id is missing.',
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}

		try {
			activateStoredOpenRouterKey(keyId);

			return {
				keys: listStoredOpenRouterKeys(),
				status: 'success',
				message: 'Stored key activated.',
				selectedModelId: getConfiguredModelId()
			} satisfies FormState;
		} catch (error) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: toErrorMessage(error),
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}
	},

	deleteKey: async ({ request }) => {
		const formData = await request.formData();
		const keyId = asString(formData.get('keyId')).trim();

		if (keyId.length === 0) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: 'Stored key id is missing.',
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}

		try {
			removeStoredOpenRouterKey(keyId);

			return {
				keys: listStoredOpenRouterKeys(),
				status: 'success',
				message: 'Stored key removed.',
				selectedModelId: getConfiguredModelId()
			} satisfies FormState;
		} catch (error) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: toErrorMessage(error),
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}
	},

	saveModel: async ({ request }) => {
		const formData = await request.formData();
		const modelId = asString(formData.get('modelId')).trim();

		if (modelId.length === 0) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: 'Model selection is missing.',
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}

		try {
			const model = setConfiguredModel(modelId);

			return {
				keys: listStoredOpenRouterKeys(),
				status: 'success',
				message: `Active model set to ${model.name}.`,
				selectedModelId: model.id
			} satisfies FormState;
		} catch (error) {
			return fail(400, {
				keys: listStoredOpenRouterKeys(),
				status: 'error',
				message: toErrorMessage(error),
				selectedModelId: getConfiguredModelId()
			} satisfies FormState);
		}
	}
};
