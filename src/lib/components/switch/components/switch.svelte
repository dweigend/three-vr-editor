<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';

	import { switchControlClass, switchThumbClass } from '../switch.svelte';
	import type { SwitchProps } from '../types';

	let {
		checked = $bindable(false),
		description,
		disabled = false,
		label,
		name
	}: SwitchProps = $props();
</script>

<label class="ui-switch">
	<span class="ui-stack ui-stack--tight">
		<span class="ui-label">{label}</span>
		{#if description}
			<span class="ui-field__hint">{description}</span>
		{/if}
	</span>
	<SwitchPrimitive.Root bind:checked class={switchControlClass} {disabled} {name}>
		<SwitchPrimitive.Thumb class={switchThumbClass} />
	</SwitchPrimitive.Root>
</label>
