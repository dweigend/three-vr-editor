<!--
	Purpose: Forward the official Bits UI dropdown-menu trigger API with ref support.
	Context: Consumers need the native trigger semantics from Bits UI without reimplementing focus or keyboard behavior.
	Responsibility: Bind the trigger ref and forward the remaining trigger props unchanged.
	Boundaries: This wrapper does not impose styling; shared trigger visuals belong to higher-level consumers.
-->

<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import type { DropdownMenuTriggerProps } from '../types';

	let { ref = $bindable(null), ...restProps }: DropdownMenuTriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger bind:ref {...restProps} />
