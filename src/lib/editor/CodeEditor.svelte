<!--
	Purpose: Provide a reusable CodeMirror editor with save and redo controls for local demo workflows.
	Context: The Three editor page needs a thin editor wrapper that exposes document changes without embedding route logic.
	Responsibility: Mount CodeMirror, emit content changes, and trigger save/redo actions for the active document.
	Boundaries: This component does not read files, build previews, or persist changes by itself.
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { redo, redoDepth } from '@codemirror/commands';
	import { javascript } from '@codemirror/lang-javascript';
	import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { tags } from '@lezer/highlight';
	import Plus from '@lucide/svelte/icons/plus';
	import { basicSetup, EditorView } from 'codemirror';

	import { DropdownMenu, ToolbarButton, ToolbarRoot } from '$lib/components';
	import type { ThreeSourceFileSummary } from '$lib/three/three-editor-types';

	import FileSelect from './FileSelect.svelte';

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
		files?: ThreeSourceFileSummary[];
		onChange: (value: string) => void;
		onCreateFile?: ((fileName: string) => Promise<void>) | undefined;
		onRedo?: (() => void) | undefined;
		onSave?: (() => void | Promise<void>) | undefined;
		saveDisabled?: boolean;
		selectedPath?: string;
		statusClassName?: string;
		statusText?: string;
		toolbarActions?: Snippet;
		value: string;
	};

	let {
		changedLineRanges = [],
		diagnostic = null,
		files = [],
		onChange,
		onCreateFile,
		onRedo,
		onSave,
		saveDisabled = false,
		selectedPath = $bindable(''),
		statusClassName = 'ui-toolbar-status',
		statusText = '',
		toolbarActions,
		value
	}: Props = $props();

	let canRedo = $state(false);
	let isCreateMenuOpen = $state(false);
	let isCreatingFile = $state(false);
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
			onRedo?.();
		}
	}

	async function handleSave(): Promise<void> {
		if (saveDisabled) {
			return;
		}

		await onSave?.();
	}

	async function handleCreateFile(): Promise<void> {
		if (!onCreateFile || isCreatingFile) {
			return;
		}

		const requestedFileName = window.prompt('New Three file name', 'new-scene');
		const normalizedFileName = requestedFileName?.trim() ?? '';

		if (normalizedFileName.length === 0) {
			return;
		}

		isCreatingFile = true;
		isCreateMenuOpen = false;

		try {
			await onCreateFile(normalizedFileName);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : 'Create file failed.');
		} finally {
			isCreatingFile = false;
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
</script>

<div class="ui-code-editor">
	<ToolbarRoot class="ui-code-editor__toolbar" aria-label="Editor toolbar">
		<div class="ui-toolbar__group ui-toolbar__group--editor ui-toolbar__group--editor-main">
			{#if files.length > 0}
				<FileSelect files={files} bind:value={selectedPath} compact label="Editor file" />
			{/if}

			{#if onCreateFile}
				<DropdownMenu.Root bind:open={isCreateMenuOpen}>
					<DropdownMenu.Trigger
						aria-label="Create new file"
						class="ui-button ui-button--ghost ui-button--sm ui-toolbar-button ui-code-editor__toolbar-button ui-code-editor__toolbar-button--icon"
						disabled={isCreatingFile}
						title="Create new file"
					>
						<Plus aria-hidden="true" size={16} />
					</DropdownMenu.Trigger>

					<DropdownMenu.Portal>
						<DropdownMenu.Content class="ui-code-editor__create-menu" sideOffset={8}>
							<DropdownMenu.Item
								class="ui-code-editor__create-menu-item"
								onSelect={() => {
									void handleCreateFile();
								}}
								textValue="Blank file"
							>
								<div class="ui-code-editor__create-menu-copy">
									<span class="ui-code-editor__create-menu-title">Blank file</span>
									<span class="ui-code-editor__create-menu-meta">Prompt for a new scene name</span>
								</div>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			{/if}

			<ToolbarButton type="button" onclick={handleSave} disabled={saveDisabled}>
				Save
			</ToolbarButton>
			<ToolbarButton
				class="ui-button--ghost"
				type="button"
				onclick={handleRedo}
				disabled={!canRedo}
			>
				Redo
			</ToolbarButton>
		</div>

		<div class="ui-toolbar__group ui-toolbar__group--editor ui-toolbar__group--editor-meta">
			{#if statusText}
				<p class={statusClassName} title={statusText}>{statusText}</p>
			{/if}

			{@render toolbarActions?.()}
		</div>
	</ToolbarRoot>

	<div class="ui-code-editor__body">
		<div class="editor-root" bind:this={editorRoot}></div>
	</div>
</div>

<style>
	.editor-root {
		height: 100%;
		min-width: 0;
	}

	.ui-toolbar__group--editor {
		gap: 0.5rem;
		flex-wrap: nowrap;
		min-width: 0;
	}

	.ui-code-editor__toolbar {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--ui-space-3);
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
	}

	.ui-toolbar__group--editor-main {
		justify-content: flex-start;
	}

	.ui-toolbar__group--editor-meta {
		justify-content: flex-end;
	}

	.ui-code-editor__toolbar-button--icon {
		width: 2.2rem;
		min-width: 2.2rem;
		padding-inline: 0;
	}

	.ui-code-editor__create-menu {
		width: 14rem;
		padding: 0.35rem;
	}

	.ui-code-editor__create-menu-item {
		padding: 0;
	}

	.ui-code-editor__create-menu-copy {
		display: grid;
		gap: 0.22rem;
		padding: 0.75rem 0.85rem;
	}

	.ui-code-editor__create-menu-title {
		color: var(--ui-color-text);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		line-height: 1.1;
		text-transform: uppercase;
	}

	.ui-code-editor__create-menu-meta {
		color: var(--ui-color-text-muted);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		line-height: 1.2;
	}

	:global(.ui-code-editor__create-menu-item[data-highlighted] .ui-code-editor__create-menu-copy) {
		background: rgba(168, 85, 247, 0.16);
	}

	:global(.cm-lineWrapping) {
		white-space: break-spaces;
		word-break: break-word;
	}

	:global(.cm-editor) {
		height: 100%;
		max-width: 100%;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}
</style>
