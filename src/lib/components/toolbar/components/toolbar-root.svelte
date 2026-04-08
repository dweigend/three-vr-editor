<!--
	Purpose: Render a thin accessible toolbar wrapper built on top of Bits UI.
	Context: Editor chrome should reuse one semantic toolbar surface instead of ad-hoc div rows.
	Responsibility: Forward toolbar props to Bits UI Root while attaching the shared local toolbar class.
	Boundaries: This component does not manage domain state or decide which actions belong in the toolbar.
-->

<script lang="ts">
	import { Toolbar } from 'bits-ui';

	import { joinClassNames } from '$lib/utils/class-names';

	type Props = Toolbar.RootProps & {
		class?: string;
	};

	let { children, class: className = '', ...restProps }: Props = $props();
</script>

<Toolbar.Root {...restProps} class={joinClassNames('ui-toolbar ui-toolbar-root', className)}>
	{@render children?.()}
</Toolbar.Root>
