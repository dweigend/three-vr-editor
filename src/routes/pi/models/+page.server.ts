/**
 * Purpose: Power the minimal model settings page for the Pi demo.
 * Context: The UI should expose a small fixed set of OpenRouter models and save the active selection.
 * Responsibility: Load model metadata and persist the selected model through a simple form action.
 * Boundaries: This route does not validate API keys or handle chat sessions.
 */

import { fail } from '@sveltejs/kit';

import { getConfiguredModelId, PI_DEMO_MODELS, setConfiguredModel } from '$lib/server/pi/models';

import type { Actions, PageServerLoad } from './$types';

type ModelActionState = {
	status: 'success' | 'error';
	message: string;
	selectedModelId: string;
};

function asString(value: FormDataEntryValue | null): string {
	return typeof value === 'string' ? value : '';
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Unexpected server error.';
}

export const load: PageServerLoad = async () => {
	return {
		models: PI_DEMO_MODELS,
		selectedModelId: getConfiguredModelId()
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const modelId = asString(formData.get('modelId')).trim();

		if (modelId.length === 0) {
			return fail(400, {
				status: 'error',
				message: 'Model selection is missing.',
				selectedModelId: getConfiguredModelId()
			} satisfies ModelActionState);
		}

		try {
			const model = setConfiguredModel(modelId);

			return {
				status: 'success',
				message: `Active model set to ${model.name}.`,
				selectedModelId: model.id
			} satisfies ModelActionState;
		} catch (error) {
			return fail(400, {
				status: 'error',
				message: toErrorMessage(error),
				selectedModelId: getConfiguredModelId()
			} satisfies ModelActionState);
		}
	}
};
