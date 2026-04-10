import { describe, expect, it } from 'vitest';

import {
	buildEditorLiveCommitRequest,
	createEditorLiveParameterValueMap
} from './editor-live-layer-commit';
import type { EditorLiveResolvedParameter } from './editor-live-layer-types';
import type { ThreeEditorActiveFileContext } from './three-editor-workspace-types';

const TEMPLATE_SOURCE = `import {
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
\t\t\tmin: 0.8,
\t\t\tmax: 2.2,
\t\t\tstep: 0.1,
\t\t\tdefaultValue: 1.4
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\tbackground: '#020617',
\tcubeColor: '#22c55e',
\tcubeSize: 1.2
});
`;

const MISSING_PARAMETER_BLOCK_SOURCE = `import { defineThreeTemplateUi } from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'missing-parameters',
\ttitle: 'Missing parameters',
\tdescription: 'No parameter block yet.',
\trendererKind: 'webgl',
\ttags: ['geometry'],
\tparameters: []
});
`;

function createActiveFileContext(content: string): ThreeEditorActiveFileContext {
	return {
		content,
		isDirty: false,
		path: 'scenes/example.ts',
		savedContent: content
	};
}

function createResolvedParameter(
	key: string,
	resolvedValue: string | number
): EditorLiveResolvedParameter {
	if (typeof resolvedValue === 'number') {
		return {
			defaultValue: resolvedValue,
			definition: {
				control: 'range',
				defaultValue: resolvedValue,
				key,
				label: key,
				max: 10,
				min: 0
			},
			documentValue: resolvedValue,
			hasOverride: false,
			key,
			overrideValue: null,
			resolvedValue
		};
	}

	return {
		defaultValue: resolvedValue,
		definition: {
			control: 'color',
			defaultValue: resolvedValue,
			key,
			label: key
		},
		documentValue: resolvedValue,
		hasOverride: false,
		key,
		overrideValue: null,
		resolvedValue
	};
}

describe('buildEditorLiveCommitRequest', () => {
	it('returns null when the active file context is missing', () => {
		expect(buildEditorLiveCommitRequest(null, [])).toBeNull();
	});

	it('returns null when the active file has no editable parameter block', () => {
		expect(
			buildEditorLiveCommitRequest(createActiveFileContext(MISSING_PARAMETER_BLOCK_SOURCE), [])
		).toBeNull();
	});

	it('rewrites the declared template parameter block with resolved live values', () => {
		const commitRequest = buildEditorLiveCommitRequest(createActiveFileContext(TEMPLATE_SOURCE), [
			createResolvedParameter('cubeColor', '#f97316'),
			createResolvedParameter('cubeSize', 1.8)
		]);

		expect(commitRequest).toEqual({
			content: `import {
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
\t\t\tmin: 0.8,
\t\t\tmax: 2.2,
\t\t\tstep: 0.1,
\t\t\tdefaultValue: 1.4
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\t"background": "#020617",
\t"cubeColor": "#f97316",
\t"cubeSize": 1.8
});
`,
			parameters: {
				background: '#020617',
				cubeColor: '#f97316',
				cubeSize: 1.8
			},
			path: 'scenes/example.ts'
		});
	});
});

describe('createEditorLiveParameterValueMap', () => {
	it('reduces resolved parameters into a preview-ready value map', () => {
		expect(
			createEditorLiveParameterValueMap([
				createResolvedParameter('cubeColor', '#f97316'),
				createResolvedParameter('cubeSize', 1.8)
			])
		).toEqual({
			cubeColor: '#f97316',
			cubeSize: 1.8
		});
	});
});
