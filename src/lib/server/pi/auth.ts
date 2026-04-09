/**
 * Purpose: Manage stored OpenRouter API keys for the app-wide Pi integration.
 * Context: Chat, editor, and settings all rely on one active system key plus a reusable list of validated keys.
 * Responsibility: Persist keys through Pi's AuthStorage, expose masked summaries, and switch the active key.
 * Boundaries: This module does not validate keys against OpenRouter or create Pi sessions.
 */

import { createHash } from 'node:crypto';

import { AuthStorage } from '@mariozechner/pi-coding-agent';

import { PI_AUTH_PATH } from './paths';

const ACTIVE_PROVIDER = 'openrouter';
const STORED_KEY_PREFIX = 'openrouter:';

export type StoredOpenRouterKey = {
	id: string;
	maskedKey: string;
	isActive: boolean;
};

export function looksLikeOpenRouterApiKey(apiKey: string): boolean {
	return apiKey.trim().startsWith('sk-or-');
}

function createFileAuthStorage(): AuthStorage {
	return AuthStorage.create(PI_AUTH_PATH);
}

function throwIfStorageErrored(authStorage: AuthStorage): void {
	const [error] = authStorage.drainErrors();

	if (error) {
		throw error;
	}
}

function createStoredProviderId(apiKey: string): string {
	const fingerprint = createHash('sha256').update(apiKey).digest('hex').slice(0, 12);
	return `${STORED_KEY_PREFIX}${fingerprint}`;
}

function getStoredProviders(authStorage: AuthStorage): string[] {
	return authStorage.list().filter((provider) => provider.startsWith(STORED_KEY_PREFIX)).sort();
}

function getMaskedKey(apiKey: string): string {
	const normalizedKey = apiKey.trim();
	const prefix = normalizedKey.slice(0, Math.min(10, normalizedKey.length));
	const suffix = normalizedKey.slice(-4);
	return `${prefix}...${suffix}`;
}

function getStoredCredential(authStorage: AuthStorage, provider: string): string | null {
	const credential = authStorage.get(provider);

	if (credential?.type !== 'api_key') {
		return null;
	}

	const normalizedKey = credential.key.trim();
	return normalizedKey.length > 0 ? normalizedKey : null;
}

function toStoredKeySummary(provider: string, apiKey: string, activeKey: string | null): StoredOpenRouterKey {
	return {
		id: provider.slice(STORED_KEY_PREFIX.length),
		maskedKey: getMaskedKey(apiKey),
		isActive: activeKey === apiKey
	};
}

export function hasActiveOpenRouterKey(): boolean {
	return getActiveOpenRouterKey() !== null;
}

export function getActiveOpenRouterKey(): string | null {
	const authStorage = createFileAuthStorage();
	return getStoredCredential(authStorage, ACTIVE_PROVIDER);
}

export function listStoredOpenRouterKeys(): StoredOpenRouterKey[] {
	const authStorage = createFileAuthStorage();
	const activeKey = getStoredCredential(authStorage, ACTIVE_PROVIDER);

	return getStoredProviders(authStorage)
		.map((provider) => {
			const apiKey = getStoredCredential(authStorage, provider);
			return apiKey ? toStoredKeySummary(provider, apiKey, activeKey) : null;
		})
		.filter((key): key is StoredOpenRouterKey => key !== null)
		.sort((left, right) => Number(right.isActive) - Number(left.isActive) || left.id.localeCompare(right.id));
}

export function saveValidatedOpenRouterKey(apiKey: string): StoredOpenRouterKey {
	const normalizedKey = apiKey.trim();

	if (normalizedKey.length === 0) {
		throw new Error('OpenRouter API key must not be empty.');
	}

	const authStorage = createFileAuthStorage();
	const provider = createStoredProviderId(normalizedKey);
	const credential = { type: 'api_key', key: normalizedKey } as const;

	authStorage.set(provider, credential);
	authStorage.set(ACTIVE_PROVIDER, credential);
	throwIfStorageErrored(authStorage);

	return {
		id: provider.slice(STORED_KEY_PREFIX.length),
		maskedKey: getMaskedKey(normalizedKey),
		isActive: true
	};
}

export function activateStoredOpenRouterKey(id: string): void {
	const authStorage = createFileAuthStorage();
	const provider = `${STORED_KEY_PREFIX}${id}`;
	const apiKey = getStoredCredential(authStorage, provider);

	if (!apiKey) {
		throw new Error('Stored key not found.');
	}

	authStorage.set(ACTIVE_PROVIDER, { type: 'api_key', key: apiKey });
	throwIfStorageErrored(authStorage);
}

export function removeStoredOpenRouterKey(id: string): void {
	const authStorage = createFileAuthStorage();
	const provider = `${STORED_KEY_PREFIX}${id}`;
	const activeKey = getStoredCredential(authStorage, ACTIVE_PROVIDER);
	const removedKey = getStoredCredential(authStorage, provider);

	if (!removedKey) {
		throw new Error('Stored key not found.');
	}

	authStorage.remove(provider);

	if (activeKey === removedKey) {
		const remainingProvider = getStoredProviders(authStorage).find((candidate) => candidate !== provider);
		const replacementKey = remainingProvider ? getStoredCredential(authStorage, remainingProvider) : null;

		if (replacementKey) {
			authStorage.set(ACTIVE_PROVIDER, { type: 'api_key', key: replacementKey });
		} else {
			authStorage.remove(ACTIVE_PROVIDER);
		}
	}

	throwIfStorageErrored(authStorage);
}
