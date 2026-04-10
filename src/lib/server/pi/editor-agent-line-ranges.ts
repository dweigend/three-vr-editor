import type { EditorLineRange } from '$lib/features/editor/editor-diagnostics';

export function normalizeChangedLineRanges(
	ranges: EditorLineRange[] | undefined,
	previousContent: string,
	nextContent: string
): EditorLineRange[] {
	const normalizedRanges = sanitizeEditorLineRanges(ranges ?? [], getDocumentLineCount(nextContent));

	if (normalizedRanges.length > 0) {
		return normalizedRanges;
	}

	return computeChangedLineRanges(previousContent, nextContent);
}

export function computeChangedLineRanges(
	previousContent: string,
	nextContent: string
): EditorLineRange[] {
	const previousLines = previousContent.split('\n');
	const nextLines = nextContent.split('\n');
	const changedLineNumbers: number[] = [];
	const maxLineCount = Math.max(previousLines.length, nextLines.length);

	for (let index = 0; index < maxLineCount; index += 1) {
		if (previousLines[index] !== nextLines[index]) {
			changedLineNumbers.push(Math.min(index + 1, nextLines.length));
		}
	}

	return collapseLineNumbersIntoRanges(changedLineNumbers);
}

export function sanitizeEditorLineRanges(
	ranges: EditorLineRange[],
	lineCount: number
): EditorLineRange[] {
	const sanitizedRanges = ranges
		.map((range) => ({
			endLine: clampLineNumber(Math.max(range.startLine, range.endLine), lineCount),
			startLine: clampLineNumber(Math.min(range.startLine, range.endLine), lineCount)
		}))
		.filter((range) => Number.isInteger(range.startLine) && Number.isInteger(range.endLine))
		.sort((left, right) => left.startLine - right.startLine || left.endLine - right.endLine);

	if (sanitizedRanges.length === 0) {
		return [];
	}

	const mergedRanges: EditorLineRange[] = [];

	for (const range of sanitizedRanges) {
		const previousRange = mergedRanges.at(-1);

		if (!previousRange || range.startLine > previousRange.endLine + 1) {
			mergedRanges.push(range);
			continue;
		}

		previousRange.endLine = Math.max(previousRange.endLine, range.endLine);
	}

	return mergedRanges;
}

function collapseLineNumbersIntoRanges(lineNumbers: number[]): EditorLineRange[] {
	if (lineNumbers.length === 0) {
		return [];
	}

	const ranges: EditorLineRange[] = [];
	let currentRange: EditorLineRange | null = null;

	for (const lineNumber of lineNumbers) {
		if (!currentRange) {
			currentRange = {
				endLine: lineNumber,
				startLine: lineNumber
			};
			continue;
		}

		if (lineNumber <= currentRange.endLine + 1) {
			currentRange.endLine = lineNumber;
			continue;
		}

		ranges.push(currentRange);
		currentRange = {
			endLine: lineNumber,
			startLine: lineNumber
		};
	}

	if (currentRange) {
		ranges.push(currentRange);
	}

	return ranges;
}

function clampLineNumber(lineNumber: number, lineCount: number): number {
	return Math.min(Math.max(1, lineNumber), lineCount);
}

function getDocumentLineCount(content: string): number {
	return content.split('\n').length;
}
