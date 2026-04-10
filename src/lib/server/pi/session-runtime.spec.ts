import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getPiSessionDir } from './paths';
import { assertManagedPiSessionFile } from './session-runtime';

describe('getPiSessionDir', () => {
	it('builds separate managed session directories per scope', () => {
		expect(getPiSessionDir('chat')).not.toBe(getPiSessionDir('editor'));
		expect(getPiSessionDir('chat')).toContain('/sessions/chat');
		expect(getPiSessionDir('editor')).toContain('/sessions/editor');
	});
});

describe('assertManagedPiSessionFile', () => {
	it('accepts files inside the matching scope directory', () => {
		const chatSessionFile = resolve(getPiSessionDir('chat'), 'session.json');

		expect(assertManagedPiSessionFile('chat', chatSessionFile)).toBe(chatSessionFile);
	});

	it('rejects files from a different scope directory', () => {
		const chatSessionFile = resolve(getPiSessionDir('chat'), 'session.json');

		expect(() => assertManagedPiSessionFile('editor', chatSessionFile)).toThrow(
			'Session file is outside the managed Pi scope directory.'
		);
	});
});
