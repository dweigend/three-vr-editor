/**
 * Purpose: Provide small CodeMirror extensions for line-based editor highlights.
 * Context: The Three editor needs one red error marker and one green applied-change marker without route-specific state in the editor component.
 * Responsibility: Define line-range types, editor extensions, and helpers to apply or clear diagnostic and changed-line marks.
 * Boundaries: This module does not parse preview errors or decide when a highlight should be shown.
 */

import { StateEffect, StateField, type Text } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';

export type EditorDiagnostic = {
	column: number | null;
	line: number | null;
	message: string;
	path: string;
};

export type EditorLineRange = {
	endLine: number;
	startLine: number;
};

const setDiagnosticLineEffect = StateEffect.define<number | null>();
const setChangedLineRangesEffect = StateEffect.define<EditorLineRange[]>();
const diagnosticLineDecoration = Decoration.line({
	attributes: {
		class: 'cm-diagnostic-line'
	}
});
const changedLineDecoration = Decoration.line({
	attributes: {
		class: 'cm-changed-line'
	}
});

const diagnosticLineField = StateField.define<DecorationSet>({
	create: () => Decoration.none,
	update: (decorations, transaction) => {
		decorations = decorations.map(transaction.changes);

		for (const effect of transaction.effects) {
			if (effect.is(setDiagnosticLineEffect)) {
				return createDiagnosticDecorations(transaction.state.doc, effect.value);
			}
		}

		return decorations;
	},
	provide: (field) => EditorView.decorations.from(field)
});

const changedLineField = StateField.define<DecorationSet>({
	create: () => Decoration.none,
	update: (decorations, transaction) => {
		decorations = decorations.map(transaction.changes);

		for (const effect of transaction.effects) {
			if (effect.is(setChangedLineRangesEffect)) {
				return createChangedLineDecorations(transaction.state.doc, effect.value);
			}
		}

		return decorations;
	},
	provide: (field) => EditorView.decorations.from(field)
});

const diagnosticLineTheme = EditorView.baseTheme({
	'.cm-diagnostic-line': {
		backgroundColor: 'rgba(220, 38, 38, 0.14)'
	},
	'.cm-diagnostic-line .cm-gutterElement': {
		backgroundColor: 'rgba(220, 38, 38, 0.14)',
		color: '#b91c1c'
	},
	'.cm-changed-line': {
		backgroundColor: 'rgba(34, 197, 94, 0.16)'
	},
	'.cm-changed-line .cm-gutterElement': {
		backgroundColor: 'rgba(34, 197, 94, 0.16)',
		color: '#15803d'
	}
});

export const editorDiagnosticExtensions = [diagnosticLineField, changedLineField, diagnosticLineTheme];

export function setEditorDiagnostic(view: EditorView, diagnostic: EditorDiagnostic | null): void {
	view.dispatch({
		effects: setDiagnosticLineEffect.of(diagnostic?.line ?? null)
	});
}

export function setEditorChangedLineRanges(view: EditorView, ranges: EditorLineRange[]): void {
	view.dispatch({
		effects: setChangedLineRangesEffect.of(normalizeEditorLineRanges(ranges))
	});
}

export function createEditorLineRangeSignature(ranges: EditorLineRange[]): string {
	return normalizeEditorLineRanges(ranges)
		.map((range) => `${range.startLine}:${range.endLine}`)
		.join(',');
}

function createDiagnosticDecorations(document: Text, lineNumber: number | null): DecorationSet {
	if (!lineNumber || lineNumber < 1 || lineNumber > document.lines) {
		return Decoration.none;
	}

	return Decoration.set([diagnosticLineDecoration.range(document.line(lineNumber).from)]);
}

function createChangedLineDecorations(document: Text, ranges: EditorLineRange[]): DecorationSet {
	const decorations = normalizeEditorLineRanges(ranges).flatMap((range) => {
		const startLine = Math.max(1, range.startLine);
		const endLine = Math.min(document.lines, range.endLine);
		const nextDecorations = [];

		for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
			nextDecorations.push(changedLineDecoration.range(document.line(lineNumber).from));
		}

		return nextDecorations;
	});

	return decorations.length > 0 ? Decoration.set(decorations) : Decoration.none;
}

function normalizeEditorLineRanges(ranges: EditorLineRange[]): EditorLineRange[] {
	return ranges
		.map((range) => ({
			endLine: Math.max(range.startLine, range.endLine),
			startLine: Math.max(1, range.startLine)
		}))
		.filter((range) => Number.isInteger(range.startLine) && Number.isInteger(range.endLine))
		.sort((left, right) => left.startLine - right.startLine || left.endLine - right.endLine);
}
