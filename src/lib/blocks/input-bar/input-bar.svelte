<!-- Shared prompt/composer row. -->

<script lang="ts">
	import { CommandInput, Textarea } from '$lib/components';
	import { joinClassNames } from '$lib/utils/class-names';

	import type { InputBarProps } from './types';

	let {
		ariaLabel,
		autocomplete,
		class: className = '',
		disabled = false,
		enterKeyHint,
		inputClass = '',
		inputId,
		inputMode = 'multiline',
		inputName,
		leading,
		placeholder,
		readonly = false,
		required = false,
		rows = 1,
		spellcheck,
		trailing,
		value = $bindable(''),
		variant = 'default',
		...restProps
	}: InputBarProps = $props();

	const hasLeading = $derived(Boolean(leading));
	const hasTrailing = $derived(Boolean(trailing));
	const rowClassName = $derived(
		joinClassNames(
			'input-bar__row',
			!hasLeading && !hasTrailing && 'input-bar__row--input-only',
			!hasLeading && hasTrailing && 'input-bar__row--no-leading',
			hasLeading && !hasTrailing && 'input-bar__row--no-trailing'
		)
	);
	const rootClassName = $derived(
		joinClassNames('input-bar', variant === 'command-line' && 'input-bar--command-line', className)
	);
</script>

<div
	{...restProps}
	class={rootClassName}
	data-disabled={disabled ? 'true' : 'false'}
>
	<div class={rowClassName}>
		{#if hasLeading}
			<div class="input-bar__lead">
				{@render leading?.()}
			</div>
		{/if}

		{#if inputMode === 'command'}
			<CommandInput
				bind:value
				aria-label={ariaLabel}
				{autocomplete}
				class={joinClassNames('input-bar__input input-bar__input--command', inputClass)}
				disabled={disabled}
				enterkeyhint={enterKeyHint}
				id={inputId}
				name={inputName}
				{placeholder}
				{readonly}
				{required}
				{spellcheck}
			/>
		{:else}
			<Textarea
				bind:value
				aria-label={ariaLabel}
				autocapitalize="off"
				{autocomplete}
				class={joinClassNames('input-bar__input', inputClass)}
				disabled={disabled}
				enterkeyhint={enterKeyHint}
				id={inputId}
				name={inputName}
				{placeholder}
				{readonly}
				{required}
				{rows}
				{spellcheck}
			/>
		{/if}

		{#if hasTrailing}
			<div class="input-bar__trailing">
				{@render trailing?.()}
			</div>
		{/if}
	</div>
</div>
