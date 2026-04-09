/**
 * Purpose: Power the consolidated Pi settings page.
 * Context: This route combines OpenRouter key management and model selection in one place.
 * Responsibility: Load masked key summaries, model metadata, and handle the small settings actions.
 * Boundaries: Pi chat sessions stay on the dedicated chat route.
 */

import { fail } from '@sveltejs/kit';

import {
	activateStoredOpenRouterKey,
	hasActiveOpenRouterKey,
	listStoredOpenRouterKeys,
	removeStoredOpenRouterKey,
	saveValidatedOpenRouterKey
} from '$lib/server/pi/auth';
import { getConfiguredModelId, PI_MODELS, setConfiguredModel } from '$lib/server/pi/models';
import { validateOpenRouterKey } from '$lib/server/pi/openrouter-validation';

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

function createErrorState(message: string) {
	return {
		keys: listStoredOpenRouterKeys(),
		status: 'error',
		message,
		selectedModelId: getConfiguredModelId()
	} satisfies FormState;
}

function createSuccessState(message: string, selectedModelId = getConfiguredModelId()) {
	return {
		keys: listStoredOpenRouterKeys(),
		status: 'success',
		message,
		selectedModelId
	} satisfies FormState;
}

export const load: PageServerLoad = async () => {
	return {
		hasActiveKey: hasActiveOpenRouterKey(),
		keys: listStoredOpenRouterKeys(),
		models: PI_MODELS,
		selectedModelId: getConfiguredModelId()
	};
};

export const actions: Actions = {
	addKey: async ({ request }) => {
		const formData = await request.formData();
		const apiKey = asString(formData.get('apiKey')).trim();

		if (apiKey.length === 0) {
			return fail(400, createErrorState('OpenRouter API key must not be empty.'));
		}

		try {
			await validateOpenRouterKey(apiKey);
			saveValidatedOpenRouterKey(apiKey);

			return createSuccessState('Key validated and stored.');
		} catch (error) {
			return fail(400, createErrorState(toErrorMessage(error)));
		}
	},

	activateKey: async ({ request }) => {
		const formData = await request.formData();
		const keyId = asString(formData.get('keyId')).trim();

		if (keyId.length === 0) {
			return fail(400, createErrorState('Stored key id is missing.'));
		}

		try {
			activateStoredOpenRouterKey(keyId);
			return createSuccessState('Stored key activated.');
		} catch (error) {
			return fail(400, createErrorState(toErrorMessage(error)));
		}
	},

	deleteKey: async ({ request }) => {
		const formData = await request.formData();
		const keyId = asString(formData.get('keyId')).trim();

		if (keyId.length === 0) {
			return fail(400, createErrorState('Stored key id is missing.'));
		}

		try {
			removeStoredOpenRouterKey(keyId);
			return createSuccessState('Stored key removed.');
		} catch (error) {
			return fail(400, createErrorState(toErrorMessage(error)));
		}
	},

	saveModel: async ({ request }) => {
		const formData = await request.formData();
		const modelId = asString(formData.get('modelId')).trim();

		if (modelId.length === 0) {
			return fail(400, createErrorState('Model selection is missing.'));
		}

		try {
			const model = setConfiguredModel(modelId);
			return createSuccessState(`Active model set to ${model.name}.`, model.id);
		} catch (error) {
			return fail(400, createErrorState(toErrorMessage(error)));
		}
	}
};
