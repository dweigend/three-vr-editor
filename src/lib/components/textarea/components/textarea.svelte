<!--
	Purpose: Render a shared multiline text input aligned with the local ui-system primitives.
	Context: Chat and editor surfaces need a reusable textarea primitive with consistent styling hooks.
	Responsibility: Forward standard textarea props while attaching the shared family class.
	Boundaries: This component stays presentational and does not own validation or submission behavior.
-->

<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	import { joinClassNames } from '$lib/utils/class-names';

	type Props = SvelteHTMLElements['textarea'] & {
		class?: string;
		value?: string;
	};

	let { class: className = '', value = $bindable(''), ...restProps }: Props = $props();
</script>

<textarea bind:value class={joinClassNames('ui-textarea', className)} {...restProps}></textarea>
