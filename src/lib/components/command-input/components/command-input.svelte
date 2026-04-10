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
