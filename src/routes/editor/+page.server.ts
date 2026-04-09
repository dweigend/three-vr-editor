/**
 * Purpose: Load the Three editor workspace page.
 * Context: The editor route combines managed file editing, live preview, template creation, and the Pi editor panel.
 * Responsibility: Return editor bootstrap data plus the active Pi key, model, and editor-session status.
 * Boundaries: Pi requests run through dedicated child JSON endpoints, not through this page load.
 */

import { hasActiveOpenRouterKey } from '$lib/server/pi/auth';
import { readEditorAgentSession } from '$lib/server/pi/editor-agent';
import { getConfiguredModel } from '$lib/server/pi/models';
import { clearPiSessionCookie, getPiSessionCookie } from '$lib/server/pi/session-cookie';
import { loadEditorWorkspacePageData } from '$lib/server/editor/editor-workspace-load';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const editorData = await loadEditorWorkspacePageData();
	const hasActiveKey = hasActiveOpenRouterKey();
	const configuredModel = getConfiguredModel();
	const editorSessionFile = getPiSessionCookie(cookies, 'editor');

	if (!editorSessionFile || !hasActiveKey) {
		return {
			...editorData,
			configuredModel,
			hasActiveKey,
			initialEditorMessages: [],
			initialEditorSessionReady: false
		};
	}

	try {
		const sessionState = await readEditorAgentSession({
			activeFileContext: {
				content: editorData.document.content,
				isDirty: false,
				path: editorData.document.path,
				savedContent: editorData.document.content
			},
			sessionFile: editorSessionFile
		});

		return {
			...editorData,
			configuredModel,
			hasActiveKey,
			initialEditorMessages: sessionState.messages,
			initialEditorSessionReady: sessionState.sessionReady
		};
	} catch {
		clearPiSessionCookie(cookies, 'editor');

		return {
			...editorData,
			configuredModel,
			hasActiveKey,
			initialEditorMessages: [],
			initialEditorSessionReady: false
		};
	}
};
