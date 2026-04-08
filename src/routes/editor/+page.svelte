<!--
	Purpose: Provide a minimal editor foundation page for local verification.
	Context: This route confirms that the repository's default editor stack is wired up without Three or Pi concerns.
	Responsibility: Mount a single CodeMirror-backed editor instance with basic setup and Svelte language support.
	Boundaries: No server calls, no Pi integration, and no custom styling beyond CodeMirror defaults.
-->

<script lang="ts">
	import { resolve } from '$app/paths';
	import { basicSetup, EditorView } from 'codemirror';
	import { svelte } from '@replit/codemirror-lang-svelte';

	let editorRoot: HTMLDivElement | undefined;

	const initialDocument: string = [
		'<script lang="ts">',
		"\tlet name = 'CodeMirror';",
		'</scr' + 'ipt>',
		'',
		'<h1>Hello {name}</h1>',
		'<p>This is a minimal Svelte example.</p>'
	].join('\n');

	$effect(() => {
		if (!editorRoot) {
			return;
		}

		const view = new EditorView({
			doc: initialDocument,
			extensions: [basicSetup, svelte()],
			parent: editorRoot
		});

		return () => {
			view.destroy();
		};
	});
</script>

<svelte:head>
	<title>Editor Demo</title>
</svelte:head>

<section class="ui-screen ui-screen--workbench">
	<div class="ui-toolbar">
		<div class="ui-toolbar__group">
			<p class="ui-surface-label">Editor</p>
		</div>
		<div class="ui-toolbar__spacer"></div>
		<a class="ui-button ui-button--ghost ui-button--sm" href={resolve('/')}>Back to demos</a>
	</div>

	<section class="ui-pane ui-pane--plain">
		<div class="editor-surface" bind:this={editorRoot}></div>
	</section>
</section>

<style>
	.editor-surface {
		height: 100%;
		min-height: 0;
	}

	.editor-surface :global(.cm-editor) {
		height: 100%;
		background: transparent;
	}
</style>
