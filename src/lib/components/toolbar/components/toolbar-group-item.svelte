<script lang="ts">
	import { Toolbar } from 'bits-ui';

	import { joinClassNames } from '$lib/utils/class-names';

	type Props = Toolbar.GroupItemProps & {
		class?: string;
	};

	let { children: renderContent, class: className = '', ...restProps }: Props = $props();
</script>

<Toolbar.GroupItem
	{...restProps}
	class={joinClassNames(
		'ui-button ui-button--ghost ui-button--sm ui-toolbar-button ui-toolbar-group-item',
		className
	)}
>
	{#snippet children({ pressed })}
		{@render renderContent?.({ pressed })}
	{/snippet}
</Toolbar.GroupItem>
