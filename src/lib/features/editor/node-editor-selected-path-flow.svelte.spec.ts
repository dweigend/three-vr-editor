import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { editorLiveLayer } from './editor-live-layer.svelte';
import Harness from './test-fixtures/NodeEditorSelectedPathFlowHarness.svelte';
import type { ThreePreviewBuildRequest } from './three-editor-types';
import {
	createPreviewBuildResult,
	plainScenePath,
	rangeScenePath,
	selectScenePath,
	selectedPathFlowSourceByPath
} from './test-fixtures/editor-selected-path-flow-fixture';

describe('node editor selectedPath browser flow', () => {
	const originalFetch = globalThis.fetch;

	let previewEntryPaths: string[] = [];
	let requestedFilePaths: string[] = [];

	beforeEach(() => {
		previewEntryPaths = [];
		requestedFilePaths = [];
		editorLiveLayer.reset();
		globalThis.fetch = vi.fn(mockFetch) as typeof fetch;
	});

	afterEach(() => {
		editorLiveLayer.reset();
		globalThis.fetch = originalFetch;
	});

	it('keeps node targets synced to the selected file and clears stale live overrides', async () => {
		render(Harness);

		await expect.element(page.getByText('Cube size')).toBeInTheDocument();
		await expect.element(page.getByText('Slider').first()).toBeInTheDocument();
		await expect.element(page.getByText('LFO').first()).toBeInTheDocument();
		expect(editorLiveLayer.mode).toBe('active');
		expect(editorLiveLayer.activePath).toBe(rangeScenePath);

		await userEvent.click(page.getByRole('button', { name: 'Set override' }));
		await vi.waitFor(() => {
			expect(editorLiveLayer.overrides).toEqual({ cubeSize: 1.5 });
		});
		await expect.element(page.getByText('1 live override')).toBeInTheDocument();

		await userEvent.click(page.getByRole('button', { name: 'Open select file' }));
		await expect.element(page.getByText('Render mode')).toBeInTheDocument();
		await expect.element(page.getByText('Cube size')).not.toBeInTheDocument();
		await vi.waitFor(() => {
			expect(editorLiveLayer.activePath).toBe(selectScenePath);
			expect(editorLiveLayer.resolvedParameters.map((parameter) => parameter.key)).toEqual([
				'renderMode'
			]);
			expect(editorLiveLayer.overrides).toEqual({});
		});
		await vi.waitFor(() => {
			expect(previewEntryPaths).toEqual([selectScenePath]);
		});

		await userEvent.click(page.getByRole('button', { name: 'Hide node editor' }));
		await vi.waitFor(() => {
			expect(editorLiveLayer.mode).toBe('idle');
		});

		await userEvent.click(page.getByRole('button', { name: 'Open plain file' }));
		await vi.waitFor(() => {
			expect(editorLiveLayer.activePath).toBe(plainScenePath);
			expect(editorLiveLayer.editableParameters).toEqual([]);
		});

		await userEvent.click(page.getByRole('button', { name: 'Show node editor' }));
		await expect.element(page.getByText('No target nodes')).toBeInTheDocument();
		await expect.element(
			page.getByText('plain.ts has no template metadata for node targets.')
		).toBeInTheDocument();
		await expect.element(page.getByText('Render mode')).not.toBeInTheDocument();
		await vi.waitFor(() => {
			expect(editorLiveLayer.mode).toBe('active');
		});

		await vi.waitFor(() => {
			expect(requestedFilePaths).toEqual([selectScenePath, plainScenePath]);
			expect(previewEntryPaths).toEqual([selectScenePath, plainScenePath]);
		});
	});

	async function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		const url = readRequestUrl(input);

		if (url.startsWith('/editor/file?')) {
			const requestUrl = new URL(url, 'http://localhost');
			const path = requestUrl.searchParams.get('path');

			if (!path) {
				return createJsonResponse({ message: 'Missing path.' }, 400);
			}

			requestedFilePaths.push(path);
			const content = selectedPathFlowSourceByPath[path];

			if (!content) {
				return createJsonResponse({ message: 'File not found.' }, 404);
			}

			return createJsonResponse({
				content,
				path
			});
		}

		if (url === '/editor/preview') {
			const request = JSON.parse(String(init?.body ?? '{}')) as ThreePreviewBuildRequest;
			previewEntryPaths.push(request.entryPath);
			return createJsonResponse(createPreviewBuildResult(request.entryPath));
		}

		throw new Error(`Unexpected fetch request: ${url}`);
	}
});

function readRequestUrl(input: RequestInfo | URL): string {
	if (typeof input === 'string') {
		return input;
	}

	if (input instanceof URL) {
		return input.toString();
	}

	return input.url;
}

function createJsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		headers: {
			'content-type': 'application/json'
		},
		status
	});
}
