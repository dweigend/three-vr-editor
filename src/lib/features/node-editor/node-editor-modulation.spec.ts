import { describe, expect, it } from 'vitest';

import { createNodeEditorModulationFrame } from './node-editor-modulation';
import type { NodeEditorSourceNode, NodeEditorTargetNode } from './node-editor-types';

function createRangeTargetNode(key: string, min = 0, max = 10, step = 0.5): NodeEditorTargetNode {
	return {
		defaultValue: min,
		definition: {
			control: 'range',
			defaultValue: min,
			key,
			label: key,
			max,
			min,
			step
		},
		documentValue: min,
		hasOverride: false,
		key,
		kind: 'range-target',
		overrideValue: null,
		resolvedValue: min
	};
}

const sliderSourceNode: NodeEditorSourceNode = {
	key: 'source:slider',
	kind: 'slider-source',
	label: 'Slider',
	normalizedValue: 0.25,
	speed: 0
};

const lfoSourceNode: NodeEditorSourceNode = {
	key: 'source:lfo',
	kind: 'lfo-source',
	label: 'LFO',
	normalizedValue: 0.5,
	speed: 1
};

describe('createNodeEditorModulationFrame', () => {
	it('maps a slider source into a range target override', () => {
		const frame = createNodeEditorModulationFrame(
			[
				{
					id: 'slider->cubeSize',
					source: 'source:slider',
					sourceHandle: 'source:slider-source',
					target: 'target:cubeSize',
					targetHandle: 'cubeSize-target'
				}
			],
			[sliderSourceNode],
			[createRangeTargetNode('cubeSize')],
			0
		);

		expect(frame.hasAnimatedSources).toBe(false);
		expect(frame.overrides).toEqual([
			{
				key: 'cubeSize',
				value: 2.5
			}
		]);
	});

	it('creates animated overrides for lfo sources and ignores non-range sinks', () => {
		const frame = createNodeEditorModulationFrame(
			[
				{
					id: 'lfo->cubeSize',
					source: 'source:lfo',
					sourceHandle: 'source:lfo-source',
					target: 'target:cubeSize',
					targetHandle: 'cubeSize-target'
				},
				{
					id: 'lfo->cubeColor',
					source: 'source:lfo',
					sourceHandle: 'source:lfo-source',
					target: 'target:cubeColor',
					targetHandle: 'cubeColor-target'
				}
			],
			[lfoSourceNode],
			[createRangeTargetNode('cubeSize', 0, 2, 0.1)],
			0
		);

		expect(frame.hasAnimatedSources).toBe(true);
		expect(frame.overrides).toEqual([
			{
				key: 'cubeSize',
				value: 1
			}
		]);
	});
});
