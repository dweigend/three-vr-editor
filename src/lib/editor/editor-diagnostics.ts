/**
 * Purpose: Provide a small CodeMirror extension for highlighting one diagnostic line in the editor.
 * Context: The Three editor should point users directly to the current preview error line without embedding CM state logic in the page.
 * Responsibility: Define the diagnostic type, editor extensions, and one helper to apply or clear the active line mark.
 * Boundaries: This module does not parse preview errors or own save/build behavior.
 */

import { StateEffect, StateField, type Text } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';

export type EditorDiagnostic = {
	column: number | null;
	line: number | null;
	message: string;
	path: string;
};

const setDiagnosticLineEffect = StateEffect.define<number | null>();
const diagnosticLineDecoration = Decoration.line({
	attributes: {
		class: 'cm-diagnostic-line'
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

const diagnosticLineTheme = EditorView.baseTheme({
	'.cm-diagnostic-line': {
		backgroundColor: 'rgba(220, 38, 38, 0.14)'
	},
	'.cm-diagnostic-line .cm-gutterElement': {
		backgroundColor: 'rgba(220, 38, 38, 0.14)',
		color: '#b91c1c'
	}
});

export const editorDiagnosticExtensions = [diagnosticLineField, diagnosticLineTheme];

export function setEditorDiagnostic(view: EditorView, diagnostic: EditorDiagnostic | null): void {
	view.dispatch({
		effects: setDiagnosticLineEffect.of(diagnostic?.line ?? null)
	});
}

function createDiagnosticDecorations(document: Text, lineNumber: number | null): DecorationSet {
	if (!lineNumber || lineNumber < 1 || lineNumber > document.lines) {
		return Decoration.none;
	}

	return Decoration.set([diagnosticLineDecoration.range(document.line(lineNumber).from)]);
}
