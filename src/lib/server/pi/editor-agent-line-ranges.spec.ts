import { describe, expect, it } from 'vitest';

import { computeChangedLineRanges, normalizeChangedLineRanges } from './editor-agent-line-ranges';

describe('computeChangedLineRanges', () => {
	it('returns contiguous changed ranges for differing lines', () => {
		expect(
			computeChangedLineRanges('alpha\nbeta\ngamma\ndelta', 'alpha\nBETA\nGAMMA\ndelta')
		).toEqual([
			{
				endLine: 3,
				startLine: 2
			}
		]);
	});
});

describe('normalizeChangedLineRanges', () => {
	it('keeps valid model-provided ranges and merges overlaps', () => {
		expect(
			normalizeChangedLineRanges(
				[
					{ endLine: 2, startLine: 1 },
					{ endLine: 4, startLine: 3 }
				],
				'one\ntwo\nthree\nfour',
				'ONE\nTWO\nTHREE\nFOUR'
			)
		).toEqual([
			{
				endLine: 4,
				startLine: 1
			}
		]);
	});

	it('falls back to a conservative diff range when no valid ranges are supplied', () => {
		expect(normalizeChangedLineRanges([], 'one\ntwo\nthree', 'one\nTWO\nthree')).toEqual([
			{
				endLine: 2,
				startLine: 2
			}
		]);
	});
});
