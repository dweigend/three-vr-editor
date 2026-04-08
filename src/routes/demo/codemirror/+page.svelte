<!--
	Purpose: Provide a minimal, unstyled CodeMirror test page for local verification.
	Context: This route exists to confirm that the repository's default editor stack is wired up.
	Responsibility: Mount a single CodeMirror instance with basic setup and Svelte language support.
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
	<title>CodeMirror Demo</title>
</svelte:head>

<h1>CodeMirror test</h1>
<p>This page mounts a single unstyled CodeMirror instance for a quick smoke test.</p>
<p><a href={resolve('/')}>Back to start</a></p>
<p><a href={resolve('/demo')}>Back to demos</a></p>

<div bind:this={editorRoot}></div>
