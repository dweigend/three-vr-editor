<!--
	Purpose: Render a command-palette style single-line input aligned with the local ui-system primitives.
	Context: Minimal command bars and chat composers should share one lightweight input surface.
	Responsibility: Forward standard input props while attaching the shared command-input class.
	Boundaries: This component stays presentational and does not own submission or parsing behavior.
-->

<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	import { joinClassNames } from '$lib/utils/class-names';

	type Props = SvelteHTMLElements['input'] & {
		class?: string;
		value?: string;
	};

	let { class: className = '', value = $bindable(''), ...restProps }: Props = $props();
</script>

<input bind:value class={joinClassNames('ui-command-input', className)} type="text" {...restProps} />
