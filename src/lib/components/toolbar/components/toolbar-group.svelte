<script lang="ts">
	import { Toolbar } from 'bits-ui';

	import { joinClassNames } from '$lib/utils/class-names';

	type Props = Omit<Toolbar.GroupProps, 'value'> & {
		class?: string;
		value?: Toolbar.GroupProps['value'];
	};

	let {
		children,
		class: className = '',
		value = $bindable(),
		...restProps
	}: Props = $props();
</script>

<Toolbar.Group
	{...restProps}
	bind:value
	class={joinClassNames('ui-toolbar__group ui-toolbar__group--toggle', className)}
>
	{@render children?.()}
</Toolbar.Group>
