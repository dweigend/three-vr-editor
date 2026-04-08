/**
 * Purpose: Verify that the viewer error helpers produce stable output for runtime failures.
 * Context: The Three.js demo depends on these helpers to render a readable error panel instead of crashing the page.
 * Responsibility: Cover the supported error-shape normalization and stack-location extraction cases.
 * Boundaries: These tests do not mount Svelte components or exercise WebGL rendering.
 */

import { describe, expect, it } from 'vitest';

import {
	extractErrorLocation,
	formatViewerErrorForConsole,
	toViewerError
} from './three-viewer-errors';

describe('toViewerError', () => {
	it('normalizes Error instances', () => {
		const error = new Error('Cube exploded');
		error.stack =
			'Error: Cube exploded\n    at renderFrame (/src/lib/three/create-three-viewer.ts:88:13)\n';

		expect(toViewerError(error)).toEqual({
			title: 'Three.js viewer error',
			message: 'Cube exploded',
			location: '/src/lib/three/create-three-viewer.ts:88:13',
			source: {
				column: 13,
				filePath: '/src/lib/three/create-three-viewer.ts',
				line: 88
			},
			stack:
				'Error: Cube exploded\n    at renderFrame (/src/lib/three/create-three-viewer.ts:88:13)\n'
		});
	});

	it('normalizes string errors', () => {
		expect(toViewerError('broken shader')).toEqual({
			title: 'Three.js viewer error',
			message: 'broken shader',
			location: null,
			source: null,
			stack: 'broken shader'
		});
	});
});

describe('extractErrorLocation', () => {
	it('extracts a file location from a stack trace', () => {
		expect(
			extractErrorLocation(
				'Error: boom\n    at renderFrame (http://localhost:5173/src/lib/three/create-three-viewer.ts:112:7)\n'
			)
		).toEqual({
			location: 'http://localhost:5173/src/lib/three/create-three-viewer.ts:112:7',
			source: {
				column: 7,
				filePath: 'http://localhost:5173/src/lib/three/create-three-viewer.ts',
				line: 112
			}
		});
	});

	it('returns null when the stack has no parseable location', () => {
		expect(extractErrorLocation('Error: boom\n    at anonymous\n')).toBeNull();
	});
});

describe('formatViewerErrorForConsole', () => {
	it('stringifies unknown values', () => {
		expect(formatViewerErrorForConsole({ reason: 'bad geometry' })).toBe(
			'{\n  "reason": "bad geometry"\n}'
		);
	});
});
