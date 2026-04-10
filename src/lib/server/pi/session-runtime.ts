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
import { PI_CWD, getPiSessionDir } from './paths';
import { createPiResourceLoader } from './resource-loader';
import type { PiSessionScope } from './session-cookie';

const CHAT_THINKING_LEVEL = 'low';

export type PiSessionMode = 'ephemeral' | 'persistent';

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

export function assertManagedPiSessionFile(scope: PiSessionScope, sessionFile: string): string {
	const normalizedPath = resolve(sessionFile);
	const managedSessionDir = `${resolve(getPiSessionDir(scope))}/`;

	if (!normalizedPath.startsWith(managedSessionDir)) {
		throw new Error('Session file is outside the managed Pi scope directory.');
	}

	return normalizedPath;
}

function createPiSessionManager(options: {
	mode: PiSessionMode;
	scope: PiSessionScope;
	sessionFile?: string | null;
}): SessionManager {
	if (options.mode === 'ephemeral') {
		return SessionManager.inMemory(PI_CWD);
	}

	const sessionDir = getPiSessionDir(options.scope);
	const normalizedSessionFile = options.sessionFile
		? assertManagedPiSessionFile(options.scope, options.sessionFile)
		: null;

	if (normalizedSessionFile) {
		return SessionManager.open(normalizedSessionFile, sessionDir, PI_CWD);
	}

	return SessionManager.create(PI_CWD, sessionDir);
}

export async function createConfiguredPiAgentSession(options: {
	customTools?: ToolDefinition[];
	mode: PiSessionMode;
	resourceLoader?: Awaited<ReturnType<typeof createPiResourceLoader>>;
	scope: PiSessionScope;
	sessionFile?: string | null;
	tools?: typeof readOnlyTools;
}) {
	const authStorage = createChatAuthStorage(requireActiveOpenRouterKey());
	const modelRegistry = ModelRegistry.inMemory(authStorage);
	const configuredModel = getConfiguredModel();
	const model = modelRegistry.find('openrouter', configuredModel.id);

	if (!model) {
		throw new Error(`Configured model "${configuredModel.id}" is not available.`);
	}

	const resourceLoader = options.resourceLoader ?? (await createPiResourceLoader());
	const sessionManager = createPiSessionManager({
		mode: options.mode,
		scope: options.scope,
		sessionFile: options.sessionFile
	});
	const { session } = await createAgentSession({
		cwd: PI_CWD,
		authStorage,
		customTools: options.customTools,
		modelRegistry,
		model,
		resourceLoader,
		thinkingLevel: CHAT_THINKING_LEVEL,
		tools: options.tools ?? readOnlyTools,
		sessionManager
	});

	return session;
}
