/**
 * Purpose: Centralize the low-level Pi chat runtime setup used by persisted demo sessions.
 * Context: Chat sessions need shared auth, model, prompt, and path guards before orchestration.
 * Responsibility: Create configured Pi agent sessions and validate managed session-file paths.
 * Boundaries: This module does not handle route actions or convert messages for the UI.
 */

import { resolve } from 'node:path';

import {
	AuthStorage,
	createAgentSession,
	ModelRegistry,
	readOnlyTools,
	SessionManager,
	type ToolDefinition
} from '@mariozechner/pi-coding-agent';

import { getActiveOpenRouterKey, looksLikeOpenRouterApiKey } from './auth';
import { getConfiguredModel } from './models';
import { PI_DEMO_CWD, PI_DEMO_SESSION_DIR } from './paths';
import { createPiDemoResourceLoader } from './resource-loader';

const CHAT_THINKING_LEVEL = 'low';

function createChatAuthStorage(apiKey: string): AuthStorage {
	return AuthStorage.inMemory({
		openrouter: {
			type: 'api_key',
			key: apiKey
		}
	});
}

function requireActiveOpenRouterKey(): string {
	const activeKey = getActiveOpenRouterKey();

	if (!activeKey) {
		throw new Error('Add and activate an OpenRouter key before using chat.');
	}

	if (!looksLikeOpenRouterApiKey(activeKey)) {
		throw new Error('The stored OpenRouter key is invalid. Please add the real API key again on Key setup.');
	}

	return activeKey;
}

export function assertManagedPiSessionFile(sessionFile: string): string {
	const normalizedPath = resolve(sessionFile);
	const managedSessionDir = `${resolve(PI_DEMO_SESSION_DIR)}/`;

	if (!normalizedPath.startsWith(managedSessionDir)) {
		throw new Error('Session file is outside the managed Pi demo directory.');
	}

	return normalizedPath;
}

export async function createConfiguredPiDemoAgentSession(options: {
	customTools?: ToolDefinition[];
	resourceLoader?: Awaited<ReturnType<typeof createPiDemoResourceLoader>>;
	sessionManager: SessionManager;
	tools?: typeof readOnlyTools;
}) {
	const authStorage = createChatAuthStorage(requireActiveOpenRouterKey());
	const modelRegistry = ModelRegistry.inMemory(authStorage);
	const configuredModel = getConfiguredModel();
	const model = modelRegistry.find('openrouter', configuredModel.id);

	if (!model) {
		throw new Error(`Configured model "${configuredModel.id}" is not available.`);
	}

	const resourceLoader = options.resourceLoader ?? (await createPiDemoResourceLoader());
	const { session } = await createAgentSession({
		cwd: PI_DEMO_CWD,
		authStorage,
		customTools: options.customTools,
		modelRegistry,
		model,
		resourceLoader,
		thinkingLevel: CHAT_THINKING_LEVEL,
		tools: options.tools ?? readOnlyTools,
		sessionManager: options.sessionManager
	});

	return session;
}

export async function createPiDemoAgentSession(sessionManager: SessionManager) {
	return createConfiguredPiDemoAgentSession({
		sessionManager,
		tools: readOnlyTools
	});
}
