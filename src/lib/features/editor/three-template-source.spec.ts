import { describe, expect, it } from 'vitest';

import {
	hasThreeTemplateHeader,
	readThreeTemplateSourceDetails,
	writeThreeTemplateParameters
} from './three-template-source';

const TEMPLATE_SOURCE = `/**
 * Example scene.
 */

import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\t"id": "example",
\t"title": "Example",
\t"description": "Example template",
\t"rendererKind": "webgl",
\t"tags": ["example"],
\t"parameters": [
\t\t{ "key": "color", "label": "Color", "control": "color", "defaultValue": "#ffffff" }
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\t"color": "#ffffff"
});

export const createDemoScene = () => ({ update() {}, dispose() {} });
`;

const LEGACY_TEMPLATE_SOURCE = `/**
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

const JAVASCRIPT_LITERAL_TEMPLATE_SOURCE = `import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'example-js',
\ttitle: 'Example JS',
\tdescription: 'Example template with a JavaScript object literal',
\trendererKind: 'webgl',
\ttags: ['example'],
\tparameters: [
\t\t{
\t\t\tkey: 'speed',
\t\t\tlabel: 'Speed',
\t\t\tcontrol: 'range',
\t\t\tmin: 0.1,
\t\t\tmax: 2,
\t\t\tstep: 0.1,
\t\t\tdefaultValue: 1
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\tspeed: 1
});
`;

describe('three-template-source', () => {
	it('reads helper-based template metadata and parameter values', () => {
		const result = readThreeTemplateSourceDetails(TEMPLATE_SOURCE);

		expect(result.header?.id).toBe('example');
		expect(result.parameters).toEqual({
			color: '#ffffff'
		});
	});

	it('still reads the legacy comment format', () => {
		const result = readThreeTemplateSourceDetails(LEGACY_TEMPLATE_SOURCE);

		expect(result.header?.id).toBe('example');
		expect(result.parameters).toEqual({
			color: '#ffffff'
		});
	});

	it('reads helper-based metadata from JavaScript object literals', () => {
		const result = readThreeTemplateSourceDetails(JAVASCRIPT_LITERAL_TEMPLATE_SOURCE);

		expect(result.header?.id).toBe('example-js');
		expect(result.parameters).toEqual({
			speed: 1
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

	it('rewrites the legacy managed parameter block', () => {
		const updatedSource = writeThreeTemplateParameters(LEGACY_TEMPLATE_SOURCE, {
			color: '#ff0000'
		});

		expect(updatedSource).toContain('"color": "#ff0000"');
		expect(readThreeTemplateSourceDetails(updatedSource).parameters).toEqual({
			color: '#ff0000'
		});
	});
});
