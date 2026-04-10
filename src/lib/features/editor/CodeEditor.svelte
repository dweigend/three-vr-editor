<script lang="ts">
	import { untrack } from 'svelte';
	import { javascript } from '@codemirror/lang-javascript';
	import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { tags } from '@lezer/highlight';
	import { redo, redoDepth } from '@codemirror/commands';
	import { basicSetup, EditorView } from 'codemirror';
	import type { CodeEditorToolbarState } from '$lib/features/editor/editor-workbench-types';
	import '$lib/features/editor/code-editor.css';

	import {
		createEditorLineRangeSignature,
		editorDiagnosticExtensions,
		setEditorChangedLineRanges,
		setEditorDiagnostic,
		type EditorDiagnostic,
		type EditorLineRange
	} from './editor-diagnostics';

	type Props = {
		changedLineRanges?: EditorLineRange[];
		diagnostic?: EditorDiagnostic | null;
		onChange: (value: string) => void;
		toolbarState?: CodeEditorToolbarState | null;
		value: string;
	};

	let {
		changedLineRanges = [],
		diagnostic = null,
		onChange,
		toolbarState = $bindable<CodeEditorToolbarState | null>(null),
		value
	}: Props = $props();

	let canRedo = $state(false);
	let editorRoot: HTMLDivElement | undefined = $state();
	let appliedDiagnosticLine = $state<number | null>(null);
	let appliedChangedLineRangeSignature = $state('');
	let view: EditorView | null = null;
	let isApplyingExternalValue = false;
	const editorHighlightStyle = HighlightStyle.define([
		{ tag: tags.comment, color: 'var(--ui-color-text-subtle)' },
		{ tag: [tags.keyword, tags.modifier], color: 'var(--ui-color-accent-strong)' },
		{ tag: [tags.string, tags.special(tags.string)], color: '#8fdca1' },
		{ tag: [tags.number, tags.bool, tags.null], color: '#8bb8ff' },
		{ tag: [tags.variableName, tags.propertyName], color: 'var(--ui-color-text)' },
		{ tag: [tags.typeName, tags.className, tags.definition(tags.variableName)], color: '#f4d38b' },
		{ tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#9dd6ff' },
		{ tag: [tags.operator, tags.punctuation, tags.bracket], color: 'var(--ui-color-text-muted)' }
	]);

	const editorTheme = EditorView.theme(
		{
			'&': {
				backgroundColor: 'rgba(7, 7, 10, 0.96)',
				color: 'var(--ui-color-text)',
				fontFamily: 'var(--ui-font-mono)',
				fontSize: '0.86rem'
			},
			'&.cm-focused': {
				outline: 'none'
			},
			'.cm-scroller': {
				fontFamily: 'var(--ui-font-mono)',
				lineHeight: '1.6'
			},
			'.cm-content': {
				padding: '0.5rem 0',
				caretColor: 'var(--ui-color-accent-strong)'
			},
			'.cm-line': {
				paddingLeft: '0.85rem',
				paddingRight: '1rem'
			},
			'.cm-gutters': {
				backgroundColor: 'rgba(10, 10, 14, 0.98)',
				borderRight: '1px solid rgba(255, 255, 255, 0.05)',
				color: 'var(--ui-color-text-subtle)'
			},
			'.cm-foldGutter': {
				display: 'none'
			},
			'.cm-gutterElement': {
				minWidth: '1.45rem',
				padding: '0 0.18rem 0 0.1rem',
				textAlign: 'right',
				fontSize: '0.72rem'
			},
			'.cm-activeLine': {
				backgroundColor: 'rgba(255, 255, 255, 0.035)'
			},
			'.cm-activeLineGutter': {
				backgroundColor: 'rgba(255, 255, 255, 0.02)',
				color: 'var(--ui-color-text-muted)'
			},
			'.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
				backgroundColor: 'rgba(168, 85, 247, 0.2) !important'
			},
			'.cm-cursor, .cm-dropCursor': {
				borderLeftColor: 'var(--ui-color-accent-strong)'
			}
		},
		{ dark: true }
	);
	function updateRedoState(nextView: EditorView): void {
		canRedo = redoDepth(nextView.state) > 0;
	}

	function handleRedo(): void {
		if (!view) {
			return;
		}

		if (redo(view)) {
			updateRedoState(view);
		}
	}

	$effect(() => {
		if (!editorRoot) {
			return;
		}

		const initialValue = untrack(() => value);
		const handleDocumentChange = untrack(() => onChange);
		const nextView = new EditorView({
			doc: initialValue,
			extensions: [
				basicSetup,
				editorDiagnosticExtensions,
				editorTheme,
				javascript({ typescript: true }),
				syntaxHighlighting(editorHighlightStyle),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					updateRedoState(update.view);

					if (update.docChanged && !isApplyingExternalValue) {
						handleDocumentChange(update.state.doc.toString());
					}
				})
			],
			parent: editorRoot
		});

		view = nextView;
		updateRedoState(nextView);

		return () => {
			if (view === nextView) {
				appliedDiagnosticLine = null;
				view = null;
				canRedo = false;
			}

			nextView.destroy();
		};
	});

	$effect(() => {
		if (!view) {
			return;
		}

		const nextValue = value;
		const currentValue = view.state.doc.toString();

		if (nextValue === currentValue) {
			return;
		}

		isApplyingExternalValue = true;
		view.dispatch({
			changes: {
				from: 0,
				insert: nextValue,
				to: view.state.doc.length
			}
		});
		updateRedoState(view);
		isApplyingExternalValue = false;
	});

	$effect(() => {
		if (!view) {
			return;
		}

		const nextDiagnosticLine = diagnostic?.line ?? null;

		if (appliedDiagnosticLine === nextDiagnosticLine) {
			return;
		}

		setEditorDiagnostic(view, diagnostic);
		appliedDiagnosticLine = nextDiagnosticLine;
	});

	$effect(() => {
		if (!view) {
			return;
		}

		const nextSignature = createEditorLineRangeSignature(changedLineRanges);

		if (appliedChangedLineRangeSignature === nextSignature) {
			return;
		}

		setEditorChangedLineRanges(view, changedLineRanges);
		appliedChangedLineRangeSignature = nextSignature;
	});

	$effect(() => {
		toolbarState = {
			canRedo,
			redo: handleRedo
		};
	});

	$effect(() => {
		return () => {
			toolbarState = null;
		};
	});
</script>

<div class="ui-code-editor">
	<div class="ui-code-editor__body">
		<div class="editor-root" bind:this={editorRoot}></div>
	</div>
</div>
