import { beforeEach, describe, expect, it } from 'vitest';

import { editorLiveLayer } from './editor-live-layer.svelte';
import type { ThreeEditorActiveFileContext } from './three-editor-workspace-types';

const COLOR_TEMPLATE_SOURCE = `import {
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
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\tcubeColor: '#22c55e'
});
`;

const SIZE_TEMPLATE_SOURCE = `import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'size-template',
\ttitle: 'Size Template',
\tdescription: 'A simple size template.',
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

export const templateParameters = defineThreeTemplateParameters({
\tcubeSize: 1.8
});
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

describe('editorLiveLayer', () => {
	beforeEach(() => {
		editorLiveLayer.reset();
	});

	it('stays idle while no consumer is active', () => {
		editorLiveLayer.syncActiveFileContext(createActiveFileContext(COLOR_TEMPLATE_SOURCE));

		expect(editorLiveLayer.mode).toBe('idle');
		expect(editorLiveLayer.isActive).toBe(false);
		expect(editorLiveLayer.discovery).toEqual({
			documentValues: {},
			editableParameters: [],
			path: 'scenes/example.ts',
			status: 'missing-template-header'
		});
	});

	it('materializes discovery once a consumer activates the layer', () => {
		editorLiveLayer.syncActiveFileContext(createActiveFileContext(COLOR_TEMPLATE_SOURCE));
		editorLiveLayer.setConsumerActive('control-panel', true);

		expect(editorLiveLayer.mode).toBe('active');
		expect(editorLiveLayer.discovery.status).toBe('ready');
		expect(editorLiveLayer.editableParameters.map((parameter) => parameter.key)).toEqual([
			'cubeColor'
		]);
	});

	it('remains active while at least one consumer is still enabled', () => {
		editorLiveLayer.setConsumerActive('control-panel', true);
		editorLiveLayer.setConsumerActive('node-editor', true);
		editorLiveLayer.setConsumerActive('control-panel', false);

		expect(editorLiveLayer.isActive).toBe(true);
		expect(editorLiveLayer.mode).toBe('active');
	});

	it('returns to idle and clears overrides when the last consumer deactivates', () => {
		editorLiveLayer.syncActiveFileContext(createActiveFileContext(COLOR_TEMPLATE_SOURCE));
		editorLiveLayer.setConsumerActive('control-panel', true);
		editorLiveLayer.setOverride('cubeColor', '#f97316');
		editorLiveLayer.setConsumerActive('control-panel', false);

		expect(editorLiveLayer.mode).toBe('idle');
		expect(editorLiveLayer.isActive).toBe(false);
		expect(editorLiveLayer.overrides).toEqual({});
		expect(editorLiveLayer.editableParameters).toEqual([]);
	});

	it('ignores unknown override keys', () => {
		editorLiveLayer.syncActiveFileContext(createActiveFileContext(COLOR_TEMPLATE_SOURCE));
		editorLiveLayer.setConsumerActive('control-panel', true);
		editorLiveLayer.setOverride('unknownKey', 'value');

		expect(editorLiveLayer.overrides).toEqual({});
		expect(editorLiveLayer.resolvedParameters).toEqual([
			{
				defaultValue: '#60a5fa',
				definition: {
					control: 'color',
					defaultValue: '#60a5fa',
					key: 'cubeColor',
					label: 'Cube color'
				},
				documentValue: '#22c55e',
				hasOverride: false,
				key: 'cubeColor',
				overrideValue: null,
				resolvedValue: '#22c55e'
			}
		]);
	});

	it('clears overrides and recomputes discovery when the active file path changes', () => {
		editorLiveLayer.setConsumerActive('control-panel', true);
		editorLiveLayer.syncActiveFileContext(createActiveFileContext(COLOR_TEMPLATE_SOURCE));
		editorLiveLayer.setOverride('cubeColor', '#f97316');
		editorLiveLayer.syncActiveFileContext(
			createActiveFileContext(SIZE_TEMPLATE_SOURCE, 'scenes/second-example.ts')
		);

		expect(editorLiveLayer.overrides).toEqual({});
		expect(editorLiveLayer.activePath).toBe('scenes/second-example.ts');
		expect(editorLiveLayer.discovery.documentValues).toEqual({
			cubeSize: 1.8
		});
		expect(editorLiveLayer.resolvedParameters).toEqual([
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
				hasOverride: false,
				key: 'cubeSize',
				overrideValue: null,
				resolvedValue: 1.8
			}
		]);
	});
});
