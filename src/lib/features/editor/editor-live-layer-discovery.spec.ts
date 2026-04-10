import { describe, expect, it } from 'vitest';

import { discoverEditorLiveParameters } from './editor-live-layer-discovery';
import type { ThreeEditorActiveFileContext } from './three-editor-workspace-types';

const READY_TEMPLATE_SOURCE = `import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'geometry-cube',
\ttitle: 'Geometry Cube',
\tdescription: 'A simple cube template.',
\trendererKind: 'webgl',
\ttags: ['geometry'],
\tparameters: [
\t\t{
\t\t\tkey: 'cubeColor',
\t\t\tlabel: 'Cube color',
\t\t\tcontrol: 'color',
\t\t\tdefaultValue: '#60a5fa'
\t\t},
\t\t{
\t\t\tkey: 'cubeSize',
\t\t\tlabel: 'Cube size',
\t\t\tcontrol: 'range',
\t\t\tmin: 0.5,
\t\t\tmax: 2,
\t\t\tdefaultValue: 1.2
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\tcubeColor: '#22c55e',
\tcubeSize: 1.8,
\tunusedKey: 'ignored'
});
`;

const MISSING_PARAMETER_BLOCK_SOURCE = `import { defineThreeTemplateUi } from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'geometry-cube',
\ttitle: 'Geometry Cube',
\tdescription: 'A simple cube template.',
\trendererKind: 'webgl',
\ttags: ['geometry'],
\tparameters: [
\t\t{
\t\t\tkey: 'cubeSize',
\t\t\tlabel: 'Cube size',
\t\t\tcontrol: 'range',
\t\t\tmin: 0.5,
\t\t\tmax: 2,
\t\t\tdefaultValue: 1.2
\t\t}
\t]
});
`;

const EMPTY_PARAMETERS_SOURCE = `import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'empty-template',
\ttitle: 'Empty template',
\tdescription: 'No live values.',
\trendererKind: 'webgl',
\ttags: ['empty'],
\tparameters: []
});

export const templateParameters = defineThreeTemplateParameters({});
`;

const MISSING_DECLARED_VALUE_SOURCE = `import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'missing-value',
\ttitle: 'Missing value',
\tdescription: 'Falls back to defaults.',
\trendererKind: 'webgl',
\ttags: ['fallback'],
\tparameters: [
\t\t{
\t\t\tkey: 'spinSpeed',
\t\t\tlabel: 'Spin speed',
\t\t\tcontrol: 'range',
\t\t\tmin: 0.001,
\t\t\tmax: 0.02,
\t\t\tdefaultValue: 0.01
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({});
`;

function createActiveFileContext(
	content: string,
	path = 'scenes/example.ts'
): ThreeEditorActiveFileContext {
	return {
		content,
		isDirty: false,
		path,
		savedContent: content
	};
}

describe('discoverEditorLiveParameters', () => {
	it('returns an empty result when no active file context exists', () => {
		expect(discoverEditorLiveParameters(null)).toEqual({
			documentValues: {},
			editableParameters: [],
			path: null,
			status: 'missing-template-header',
			template: null
		});
	});

	it('returns an empty result when the active file has no template header', () => {
		expect(
			discoverEditorLiveParameters(
				createActiveFileContext('export const createDemoScene = () => ({ update() {}, dispose() {} });')
			)
		).toEqual({
			documentValues: {},
			editableParameters: [],
			path: 'scenes/example.ts',
			status: 'missing-template-header',
			template: null
		});
	});

	it('returns an empty result when the template has no editable parameter block', () => {
		expect(
			discoverEditorLiveParameters(createActiveFileContext(MISSING_PARAMETER_BLOCK_SOURCE))
		).toEqual({
			documentValues: {},
			editableParameters: [],
			path: 'scenes/example.ts',
			status: 'missing-parameter-block',
			template: {
				description: 'A simple cube template.',
				id: 'geometry-cube',
				parameters: [
					{
						control: 'range',
						defaultValue: 1.2,
						key: 'cubeSize',
						label: 'Cube size',
						max: 2,
						min: 0.5
					}
				],
				rendererKind: 'webgl',
				tags: ['geometry'],
				title: 'Geometry Cube'
			}
		});
	});

	it('returns an empty result when the template exposes no editable parameters', () => {
		expect(discoverEditorLiveParameters(createActiveFileContext(EMPTY_PARAMETERS_SOURCE))).toEqual({
			documentValues: {},
			editableParameters: [],
			path: 'scenes/example.ts',
			status: 'no-editable-parameters',
			template: {
				description: 'No live values.',
				id: 'empty-template',
				parameters: [],
				rendererKind: 'webgl',
				tags: ['empty'],
				title: 'Empty template'
			}
		});
	});

	it('discovers editable parameters in their declared order', () => {
		expect(discoverEditorLiveParameters(createActiveFileContext(READY_TEMPLATE_SOURCE))).toEqual({
			documentValues: {
				cubeColor: '#22c55e',
				cubeSize: 1.8
			},
			editableParameters: [
				{
					defaultValue: '#60a5fa',
					definition: {
						control: 'color',
						defaultValue: '#60a5fa',
						key: 'cubeColor',
						label: 'Cube color'
					},
					documentValue: '#22c55e',
					key: 'cubeColor'
				},
				{
					defaultValue: 1.2,
					definition: {
						control: 'range',
						defaultValue: 1.2,
						key: 'cubeSize',
						label: 'Cube size',
						max: 2,
						min: 0.5
					},
					documentValue: 1.8,
					key: 'cubeSize'
				}
			],
			path: 'scenes/example.ts',
			status: 'ready',
			template: {
				description: 'A simple cube template.',
				id: 'geometry-cube',
				parameters: [
					{
						control: 'color',
						defaultValue: '#60a5fa',
						key: 'cubeColor',
						label: 'Cube color'
					},
					{
						control: 'range',
						defaultValue: 1.2,
						key: 'cubeSize',
						label: 'Cube size',
						max: 2,
						min: 0.5
					}
				],
				rendererKind: 'webgl',
				tags: ['geometry'],
				title: 'Geometry Cube'
			}
		});
	});

	it('falls back to the declared default value when the parameter block omits a key', () => {
		expect(
			discoverEditorLiveParameters(createActiveFileContext(MISSING_DECLARED_VALUE_SOURCE))
		).toEqual({
			documentValues: {
				spinSpeed: 0.01
			},
			editableParameters: [
				{
					defaultValue: 0.01,
					definition: {
						control: 'range',
						defaultValue: 0.01,
						key: 'spinSpeed',
						label: 'Spin speed',
						max: 0.02,
						min: 0.001
					},
					documentValue: 0.01,
					key: 'spinSpeed'
				}
			],
			path: 'scenes/example.ts',
			status: 'ready',
			template: {
				description: 'Falls back to defaults.',
				id: 'missing-value',
				parameters: [
					{
						control: 'range',
						defaultValue: 0.01,
						key: 'spinSpeed',
						label: 'Spin speed',
						max: 0.02,
						min: 0.001
					}
				],
				rendererKind: 'webgl',
				tags: ['fallback'],
				title: 'Missing value'
			}
		});
	});

	it('ignores undeclared keys from the template parameter block', () => {
		const result = discoverEditorLiveParameters(createActiveFileContext(READY_TEMPLATE_SOURCE));

		expect(result.documentValues).not.toHaveProperty('unusedKey');
		expect(result.editableParameters.map((parameter) => parameter.key)).toEqual([
			'cubeColor',
			'cubeSize'
		]);
	});
});
