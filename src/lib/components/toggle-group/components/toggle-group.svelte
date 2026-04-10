<script lang="ts">
	import { Toggle } from '$lib/components/toggle';
	import type { ToggleGroupProps } from '../types';

	let { options = [], value = $bindable('') }: ToggleGroupProps = $props();
</script>

<div class="ui-toggle-group">
	{#each options as option}
		<Toggle
			pressed={value === option.value}
			onclick={() => {
				value = option.value;
			}}
		>
			{option.label}
		</Toggle>
	{/each}
</div>
