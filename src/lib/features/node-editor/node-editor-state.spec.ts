import { describe, expect, it } from 'vitest';

import { createNodeEditorState } from './node-editor-state.svelte';
import type { NodeEditorTargetNode } from './node-editor-types';

function createNode(key: string, hasOverride = false): NodeEditorTargetNode {
	return {
		defaultValue: 1,
		definition: {
			control: 'range',
			defaultValue: 1,
			key,
			label: key,
			max: 4,
			min: 0.5
		},
		documentValue: 1,
		hasOverride,
		key,
		kind: 'range-target',
		overrideValue: hasOverride ? 2 : null,
		resolvedValue: hasOverride ? 2 : 1
	};
}

function createSelectNode(key: string): NodeEditorTargetNode {
	return {
		defaultValue: 'wireframe',
		definition: {
			control: 'select',
			defaultValue: 'wireframe',
			key,
			label: key,
			options: [
				{ label: 'Wireframe', value: 'wireframe' },
				{ label: 'Solid', value: 'solid' }
			]
		},
		documentValue: 'wireframe',
		hasOverride: false,
		key,
		kind: 'select-target',
		overrideValue: null,
		resolvedValue: 'wireframe'
	};
}

describe('createNodeEditorState', () => {
	it('selects the first visible node after syncing nodes', () => {
		const state = createNodeEditorState();

	state.sync('scenes/example.ts', [createNode('cubeSize'), createNode('cubeColor')]);

	expect(state.selectedNodeKey).toBe('cubeSize');
	expect(state.selectedNode?.key).toBe('cubeSize');
	expect(state.activePath).toBe('scenes/example.ts');
	expect(state.currentPositions).toEqual({
		'source:lfo': { x: -320, y: 180 },
		'source:slider': { x: -320, y: 0 },
		cubeColor: { x: 300, y: 0 },
		cubeSize: { x: 0, y: 0 }
	});
	expect(state.currentSourceNodes.map((node) => node.key)).toEqual(['source:slider', 'source:lfo']);
	});

	it('keeps selection aligned with the current filter and clears stale selections', () => {
		const state = createNodeEditorState();

		state.sync('scenes/example.ts', [createNode('cubeSize'), createNode('cubeColor', true)]);
		state.selectNode('cubeColor');
		state.filterMode = 'live';

		expect(state.visibleNodes.map((node) => node.key)).toEqual(['cubeColor']);
		expect(state.selectedNodeKey).toBe('cubeColor');

		state.sync('scenes/second-example.ts', [createNode('renderMode')]);

		expect(state.visibleNodes).toEqual([]);
		expect(state.selectedNodeKey).toBeNull();
		expect(state.selectedNode).toBeNull();
	});

	it('stores per-file node positions and viewport changes without affecting other files', () => {
		const state = createNodeEditorState();

		state.sync('scenes/example.ts', [createNode('cubeSize'), createNode('cubeColor')]);
		state.setNodePosition('cubeColor', { x: 520, y: 40 });
		state.setNodePosition('source:slider', { x: -400, y: 24 });
		state.syncViewport({ x: -40, y: 80, zoom: 0.9 });

		expect(state.currentPositions.cubeColor).toEqual({ x: 520, y: 40 });
		expect(state.currentPositions['source:slider']).toEqual({ x: -400, y: 24 });
		expect(state.viewport).toEqual({ x: -40, y: 80, zoom: 0.9 });

		state.sync('scenes/second-example.ts', [createNode('renderMode')]);

		expect(state.currentPositions).toEqual({
			'source:lfo': { x: -320, y: 180 },
			'source:slider': { x: -320, y: 0 },
			renderMode: { x: 0, y: 0 }
		});
		expect(state.viewport).toBeNull();

		state.sync('scenes/example.ts', [createNode('cubeSize'), createNode('cubeColor')]);

		expect(state.currentPositions.cubeColor).toEqual({ x: 520, y: 40 });
		expect(state.currentPositions['source:slider']).toEqual({ x: -400, y: 24 });
		expect(state.viewport).toEqual({ x: -40, y: 80, zoom: 0.9 });
	});

	it('stores per-file canvas connections and prunes stale edges on file changes', () => {
		const state = createNodeEditorState();

		state.sync('scenes/example.ts', [createNode('cubeSize'), createSelectNode('renderMode')]);
		state.connectNodes({
			source: 'source:slider',
			sourceHandle: 'source:slider-source',
			target: 'target:renderMode',
			targetHandle: 'renderMode-target'
		});

		expect(state.currentEdges).toEqual([]);

		state.connectNodes({
			source: 'source:slider',
			sourceHandle: 'source:slider-source',
			target: 'target:cubeSize',
			targetHandle: 'cubeSize-target'
		});

		expect(state.currentEdges).toEqual([
			expect.objectContaining({
				source: 'source:slider',
				target: 'target:cubeSize'
			})
		]);

		state.sync('scenes/second-example.ts', [createNode('renderMode')]);
		expect(state.currentEdges).toEqual([]);

		state.sync('scenes/example.ts', [createNode('cubeSize'), createNode('cubeColor')]);
		expect(state.currentEdges).toHaveLength(1);
	});

	it('updates source nodes per file without leaking values across files', () => {
		const state = createNodeEditorState();

		state.sync('scenes/example.ts', [createNode('cubeSize')]);
		state.setSourceNodeNormalizedValue('source:slider', 0.85);
		state.setSourceNodeSpeed('source:lfo', 0.75);

		expect(state.currentSourceNodes).toEqual([
			expect.objectContaining({
				key: 'source:slider',
				normalizedValue: 0.85
			}),
			expect.objectContaining({
				key: 'source:lfo',
				speed: 0.75
			})
		]);

		state.sync('scenes/second-example.ts', [createNode('renderMode')]);
		expect(state.currentSourceNodes).toEqual([
			expect.objectContaining({
				key: 'source:slider',
				normalizedValue: 0.5
			}),
			expect.objectContaining({
				key: 'source:lfo',
				speed: 0.2
			})
		]);

		state.sync('scenes/example.ts', [createNode('cubeSize')]);
		expect(state.currentSourceNodes).toEqual([
			expect.objectContaining({
				key: 'source:slider',
				normalizedValue: 0.85
			}),
			expect.objectContaining({
				key: 'source:lfo',
				speed: 0.75
			})
		]);
	});
});
