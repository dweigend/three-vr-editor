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
