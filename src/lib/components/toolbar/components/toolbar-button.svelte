<!--
	Purpose: Render a toolbar-native action button with the shared local button styling.
	Context: Toolbar actions should participate in Bits UI roving focus while matching the shared control styling.
	Responsibility: Forward button props to Bits UI Toolbar.Button and attach the shared toolbar action classes.
	Boundaries: This component stays presentational and does not own click behavior or command logic.
-->

<script lang="ts">
	import { Toolbar } from 'bits-ui';

	import { joinClassNames } from '$lib/utils/class-names';

	type Props = Toolbar.ButtonProps & {
		class?: string;
	};

	let { children, class: className = '', ...restProps }: Props = $props();
</script>

<Toolbar.Button
	{...restProps}
	class={joinClassNames('ui-button ui-button--sm ui-toolbar-button', className)}
>
	{@render children?.()}
</Toolbar.Button>
