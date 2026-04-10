import { describe, expect, it } from 'vitest';

import { createNodeEditorPanelModel, readNodeEditorEmptyState } from './node-editor-mapper';

describe('nodeEditorMapper', () => {
	it('maps resolved live parameters to registry-backed target nodes', () => {
		const model = createNodeEditorPanelModel(
			'ready',
			[
				{
					defaultValue: 1,
					definition: {
						control: 'range',
						defaultValue: 1,
						key: 'cubeSize',
						label: 'Cube size',
						max: 4,
						min: 0.5
					},
					documentValue: 1.5,
					hasOverride: true,
					key: 'cubeSize',
					overrideValue: 2,
					resolvedValue: 2
				},
				{
					defaultValue: '#ffffff',
					definition: {
						control: 'color',
						defaultValue: '#ffffff',
						key: 'cubeColor',
						label: 'Cube color'
					},
					documentValue: '#22c55e',
					hasOverride: false,
					key: 'cubeColor',
					overrideValue: null,
					resolvedValue: '#22c55e'
				}
			],
			{
				edges: [],
				filterMode: 'all',
				positions: {
					cubeColor: { x: 300, y: 0 },
					cubeSize: { x: 0, y: 0 },
					'source:lfo': { x: -320, y: 180 },
					'source:slider': { x: -320, y: 0 }
				},
				selectedNodeKey: 'cubeSize',
				sourceNodes: [
					{
						key: 'source:slider',
						kind: 'slider-source',
						label: 'Slider',
						normalizedValue: 0.5,
						speed: 0
					},
					{
						key: 'source:lfo',
						kind: 'lfo-source',
						label: 'LFO',
						normalizedValue: 0.5,
						speed: 0.2
					}
				],
				viewport: null
			}
		);

		expect(model.status).toBe('ready');
		expect(model.nodes).toEqual([
			expect.objectContaining({
				key: 'cubeSize',
				kind: 'range-target'
			}),
			expect.objectContaining({
				key: 'cubeColor',
				kind: 'color-target'
			})
		]);
		expect(model.canvasNodes).toEqual([
			expect.objectContaining({
				id: 'source:slider',
				nodeKey: 'source:slider',
				position: { x: -320, y: 0 },
				selected: false
			}),
			expect.objectContaining({
				id: 'source:lfo',
				nodeKey: 'source:lfo',
				position: { x: -320, y: 180 },
				selected: false
			}),
			expect.objectContaining({
				id: 'target:cubeSize',
				nodeKey: 'cubeSize',
				position: { x: 0, y: 0 },
				selected: true
			}),
			expect.objectContaining({
				id: 'target:cubeColor',
				nodeKey: 'cubeColor',
				position: { x: 300, y: 0 },
				selected: false
			})
		]);
		expect(model.canvasEdges).toEqual([]);
		expect(model.sourceNodes.map((node) => node.key)).toEqual(['source:slider', 'source:lfo']);
		expect(model.visibleNodes.map((node) => node.key)).toEqual(['cubeSize', 'cubeColor']);
	});

	it('returns node-editor-specific empty copy for files without template metadata', () => {
		expect(readNodeEditorEmptyState('missing-template-header', 'plain.ts')).toEqual({
			description: 'plain.ts has no template metadata for node targets.',
			title: 'No target nodes'
		});
	});
});
