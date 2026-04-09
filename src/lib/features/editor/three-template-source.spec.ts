/**
 * Purpose: Verify that optional template headers and parameter blocks can be parsed and updated without breaking plain files.
 * Context: The editor sidebar relies on these helpers to show controls only when metadata is present.
 * Responsibility: Cover header parsing, null-safe behavior, and parameter block rewriting.
 * Boundaries: These tests do not touch the filesystem, preview runtime, or Svelte components.
 */

import { describe, expect, it } from 'vitest';

import {
	hasThreeTemplateHeader,
	readThreeTemplateSourceDetails,
	writeThreeTemplateParameters
} from './three-template-source';

const TEMPLATE_SOURCE = `/**
 * Example scene.
 */

/* @three-template
{
\t"id": "example",
\t"title": "Example",
\t"description": "Example template",
\t"rendererKind": "webgl",
\t"tags": ["example"],
\t"parameters": [
\t\t{ "key": "color", "label": "Color", "control": "color", "defaultValue": "#ffffff" }
\t]
}
*/

// @three-template-parameters:start
export const templateParameters = {
\t"color": "#ffffff"
} satisfies Record<string, number | string>;
// @three-template-parameters:end

export const createDemoScene = () => ({ update() {}, dispose() {} });
`;

describe('three-template-source', () => {
	it('reads the optional template header and parameter block', () => {
		const result = readThreeTemplateSourceDetails(TEMPLATE_SOURCE);

		expect(result.header?.id).toBe('example');
		expect(result.parameters).toEqual({
			color: '#ffffff'
		});
	});

	it('returns null details when a plain scene has no template header', () => {
		expect(
			readThreeTemplateSourceDetails('export const createDemoScene = () => ({ update() {}, dispose() {} });')
		).toEqual({
			header: null,
			parameters: null
		});
		expect(hasThreeTemplateHeader('export const createDemoScene = true;')).toBe(false);
	});

	it('rewrites only the managed parameter block', () => {
		const updatedSource = writeThreeTemplateParameters(TEMPLATE_SOURCE, {
			color: '#ff0000'
		});

		expect(updatedSource).toContain('"color": "#ff0000"');
		expect(readThreeTemplateSourceDetails(updatedSource).parameters).toEqual({
			color: '#ff0000'
		});
	});
});
