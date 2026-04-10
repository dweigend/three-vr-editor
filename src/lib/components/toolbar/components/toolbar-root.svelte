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
