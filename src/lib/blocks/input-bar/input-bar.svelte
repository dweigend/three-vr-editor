<!--
	Purpose: Render a reusable input row with optional action rails around a shared textarea primitive.
	Context: Chat and editor prompts should reuse one compact composer shell adapted from the ui-system chat composer.
	Responsibility: Lay out leading controls, the main text field, and trailing actions with responsive width behavior.
	Boundaries: This block stays presentational and does not own submission, shortcuts, or async effects.
-->

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

<style>
	.input-bar {
		width: 100%;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(10, 10, 14, 0.985);
		padding: 0.8rem 0.9rem;
		transition:
			border-color var(--ui-transition-fast),
			background var(--ui-transition-fast),
			box-shadow var(--ui-transition-fast);
	}

	.input-bar:focus-within {
		border-color: rgba(168, 85, 247, 0.52);
		box-shadow: none;
	}

	.input-bar[data-disabled='true'] {
		opacity: 0.72;
	}

	.input-bar--command-line {
		border: 0;
		background: transparent;
		padding: 0;
	}

	.input-bar__row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.8rem;
	}

	.input-bar__row--no-leading {
		grid-template-columns: minmax(0, 1fr) auto;
	}

	.input-bar__row--no-trailing {
		grid-template-columns: auto minmax(0, 1fr);
	}

	.input-bar__row--input-only {
		grid-template-columns: minmax(0, 1fr);
	}

	.input-bar__lead,
	.input-bar__trailing {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		min-width: 0;
	}

	.input-bar__trailing {
		justify-content: flex-end;
	}

	.input-bar__input {
		min-width: 0;
		min-height: 2.6rem;
		padding: 0;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--ui-color-text);
		font-family: var(--ui-font-mono);
		font-size: 0.98rem;
		letter-spacing: 0.04em;
		resize: none;
	}

	.input-bar__input--command {
		min-height: 2rem;
	}

	.input-bar--command-line .input-bar__row {
		gap: 0.6rem;
	}

	.input-bar--command-line .input-bar__lead,
	.input-bar--command-line .input-bar__trailing {
		min-height: 2rem;
	}

	.input-bar--command-line .input-bar__input {
		min-height: 2rem;
		font-size: 0.92rem;
		letter-spacing: 0.03em;
		text-transform: none;
	}

	.input-bar--command-line .input-bar__lead :global(.ui-icon-button) {
		width: 2rem;
		min-width: 2rem;
		height: 2rem;
		min-height: 2rem;
		border: 0;
		background: transparent;
	}

	.input-bar--command-line .input-bar__lead :global(.ui-icon-button:hover),
	.input-bar--command-line .input-bar__lead :global(.ui-icon-button:focus-visible),
	.input-bar--command-line .input-bar__trailing :global(.ui-icon-button:hover),
	.input-bar--command-line .input-bar__trailing :global(.ui-icon-button:focus-visible) {
		border: 0;
		background: transparent;
		color: var(--ui-color-accent);
	}

	.input-bar__input:focus,
	.input-bar__input:focus-visible {
		outline: none;
		box-shadow: none;
	}

	.input-bar__lead :global(.ui-icon-button),
	.input-bar__trailing :global(.ui-icon-button) {
		width: 2.6rem;
		min-width: 2.6rem;
		height: 2.6rem;
		min-height: 2.6rem;
		border-color: rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ui-color-text-subtle);
		box-shadow: none;
	}

	.input-bar__lead :global(.ui-icon-button:hover),
	.input-bar__lead :global(.ui-icon-button:focus-visible),
	.input-bar__trailing :global(.ui-icon-button:hover),
	.input-bar__trailing :global(.ui-icon-button:focus-visible) {
		border-color: var(--ui-color-accent);
		background: rgba(255, 255, 255, 0.04);
		color: var(--ui-color-text);
	}

	.input-bar__trailing :global(.ui-button) {
		min-height: 2.6rem;
		box-shadow: none;
	}

	@media (max-width: 720px) {
		.input-bar {
			padding: 0.7rem 0.8rem;
		}

		.input-bar__row {
			gap: 0.65rem;
		}
	}
</style>
