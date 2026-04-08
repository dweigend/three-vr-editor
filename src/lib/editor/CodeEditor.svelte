<!--
	Purpose: Provide a reusable CodeMirror editor with save and redo controls for local demo workflows.
	Context: The Three editor page needs a thin editor wrapper that exposes document changes without embedding route logic.
	Responsibility: Mount CodeMirror, emit content changes, and trigger save/redo actions for the active document.
	Boundaries: This component does not read files, build previews, or persist changes by itself.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { redo, redoDepth } from '@codemirror/commands';
	import { javascript } from '@codemirror/lang-javascript';
	import { basicSetup, EditorView } from 'codemirror';

	import {
		editorDiagnosticExtensions,
		setEditorDiagnostic,
		type EditorDiagnostic
	} from './editor-diagnostics';

	type Props = {
		diagnostic?: EditorDiagnostic | null;
		onChange: (value: string) => void;
		onRedo?: (() => void) | undefined;
		onSave?: (() => void | Promise<void>) | undefined;
		saveDisabled?: boolean;
		value: string;
	};

	let { diagnostic = null, onChange, onRedo, onSave, saveDisabled = false, value }: Props = $props();

	let canRedo = $state(false);
	let editorRoot: HTMLDivElement | undefined = $state();
	let appliedDiagnosticLine = $state<number | null>(null);
	let view: EditorView | null = null;

	function updateRedoState(nextView: EditorView): void {
		canRedo = redoDepth(nextView.state) > 0;
	}

	function handleRedo(): void {
		if (!view) {
			return;
		}

		if (redo(view)) {
			updateRedoState(view);
			onRedo?.();
		}
	}

	async function handleSave(): Promise<void> {
		if (saveDisabled) {
			return;
		}

		await onSave?.();
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
				javascript({ typescript: true }),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					updateRedoState(update.view);

					if (update.docChanged) {
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

		const nextDiagnosticLine = diagnostic?.line ?? null;

		if (appliedDiagnosticLine === nextDiagnosticLine) {
			return;
		}

		setEditorDiagnostic(view, diagnostic);
		appliedDiagnosticLine = nextDiagnosticLine;
	});
</script>

<div>
	<button type="button" onclick={handleSave} disabled={saveDisabled}>Save</button>
	<button type="button" onclick={handleRedo} disabled={!canRedo}>Redo</button>
</div>

<div class="editor-root" bind:this={editorRoot}></div>

<style>
	.editor-root {
		min-width: 0;
	}

	:global(.cm-editor) {
		max-width: 100%;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}
	
	:global(.cm-lineWrapping) {
		white-space: break-spaces;
		word-break: break-word;
	}
</style>
