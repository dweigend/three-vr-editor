/**
 * Purpose: Verify that Pi session scopes stay isolated on disk.
 * Context: Chat and editor may both persist sessions, but they must never accept each other's files.
 * Responsibility: Cover scope-specific directory resolution and managed-path validation.
 * Boundaries: These tests do not create real Pi sessions or call external providers.
 */

import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getPiDemoSessionDir } from './paths';
import { assertManagedPiSessionFile } from './session-runtime';

describe('getPiDemoSessionDir', () => {
	it('builds separate managed session directories per scope', () => {
		expect(getPiDemoSessionDir('chat')).not.toBe(getPiDemoSessionDir('editor'));
		expect(getPiDemoSessionDir('chat')).toContain('/sessions/chat');
		expect(getPiDemoSessionDir('editor')).toContain('/sessions/editor');
	});
});

describe('assertManagedPiSessionFile', () => {
	it('accepts files inside the matching scope directory', () => {
		const chatSessionFile = resolve(getPiDemoSessionDir('chat'), 'session.json');

		expect(assertManagedPiSessionFile('chat', chatSessionFile)).toBe(chatSessionFile);
	});

	it('rejects files from a different scope directory', () => {
		const chatSessionFile = resolve(getPiDemoSessionDir('chat'), 'session.json');

		expect(() => assertManagedPiSessionFile('editor', chatSessionFile)).toThrow(
			'Session file is outside the managed Pi demo directory.'
		);
	});
});
