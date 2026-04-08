<!--
	Purpose: Compose a compact selection field from the dropdown-menu primitives.
	Context: Settings forms need a reusable, styled alternative to native selects that matches the UI-system reference surfaces.
	Responsibility: Render a trigger-width dropdown, synchronize the selected value, and expose a hidden form field when needed.
	Boundaries: This component stays generic; it does not submit forms or fetch option data.
-->

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	import { joinClassNames } from '$lib/utils/class-names';

	import {
		dropdownFieldContentClass,
		dropdownFieldItemClass,
		dropdownFieldRootClass,
		dropdownFieldTriggerClass
	} from '../dropdown-menu.svelte';
	import type { DropdownFieldProps } from '../types';
	import Content from './dropdown-menu-content.svelte';
	import Item from './dropdown-menu-item.svelte';
	import Portal from './dropdown-menu-portal.svelte';
	import Root from './dropdown-menu-root.svelte';
	import Trigger from './dropdown-menu-trigger.svelte';

	let {
		ariaLabel = 'Select option',
		class: className = '',
		contentClass = '',
		id,
		itemClass = '',
		name,
		options = [],
		placeholder = 'Select option',
		ref = $bindable(null),
		sideOffset = 8,
		triggerClass = '',
		value = $bindable(''),
		...restProps
	}: DropdownFieldProps = $props();

	const selectedOption = $derived(options.find((option) => option.value === value) ?? null);
	const selectedLabel = $derived(selectedOption?.label ?? placeholder);
</script>

<div bind:this={ref} {...restProps} class={joinClassNames(dropdownFieldRootClass, className)}>
	{#if name}
		<input name={name} type="hidden" value={value} />
	{/if}

	<Root>
		<Trigger
			aria-label={ariaLabel}
			class={joinClassNames(dropdownFieldTriggerClass, triggerClass)}
			{id}
		>
			<span
				class="ui-dropdown-field__value"
				data-placeholder={selectedOption ? undefined : 'true'}
			>
				{selectedLabel}
			</span>
			<ChevronDown aria-hidden="true" size={18} strokeWidth={2} />
		</Trigger>

		<Portal>
			<Content class={joinClassNames(dropdownFieldContentClass, contentClass)} {sideOffset}>
				<div class="ui-dropdown-field__list">
					{#each options as option (option.value)}
						<Item
							class={joinClassNames(dropdownFieldItemClass, itemClass)}
							disabled={option.disabled}
							onSelect={() => {
								value = option.value;
							}}
							textValue={option.label}
						>
							<div
								class="ui-dropdown-field__item-row"
								data-selected={option.value === value ? 'true' : undefined}
							>
								<div class="ui-dropdown-field__item-copy">
									<span class="ui-dropdown-field__item-label">{option.label}</span>
									{#if option.meta}
										<span class="ui-dropdown-field__item-meta">{option.meta}</span>
									{/if}
								</div>

								{#if option.value === value}
									<Check aria-hidden="true" class="ui-dropdown-field__check" size={16} strokeWidth={2.2} />
								{/if}
							</div>
						</Item>
					{/each}
				</div>
			</Content>
		</Portal>
	</Root>
</div>

<style>
	:global(.ui-dropdown-field) {
		width: 100%;
		min-width: 0;
	}

	:global(.ui-dropdown-field__trigger) {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: 2.65rem;
		padding: 0.7rem 0.9rem;
		border: 1px solid var(--ui-color-border-strong, rgba(255, 255, 255, 0.12));
		background: rgba(4, 4, 6, 0.98);
		color: var(--ui-color-text);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		line-height: 1;
		text-align: left;
		text-transform: uppercase;
	}

	:global(.ui-dropdown-field__trigger:hover) {
		border-color: rgba(168, 85, 247, 0.34);
	}

	:global(.ui-dropdown-field__trigger:focus-visible),
	:global(.ui-dropdown-field__trigger[data-state='open']) {
		outline: none;
		box-shadow: var(--ui-focus-ring);
		border-color: rgba(168, 85, 247, 0.4);
	}

	:global(.ui-dropdown-field__value) {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.ui-dropdown-field__value[data-placeholder='true']) {
		color: var(--ui-color-text-muted);
	}

	:global(.ui-dropdown-field__content) {
		width: var(--bits-dropdown-menu-anchor-width);
		min-width: var(--bits-dropdown-menu-anchor-width);
		max-width: var(--bits-dropdown-menu-anchor-width);
		padding: 0.4rem;
	}

	:global(.ui-dropdown-field__list) {
		display: grid;
		gap: 0.15rem;
	}

	:global(.ui-dropdown-field__item) {
		padding: 0;
	}

	:global(.ui-dropdown-field__item-row) {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.85rem;
		width: 100%;
		padding: 0.8rem 0.9rem;
		color: var(--ui-color-text);
	}

	:global(.ui-dropdown-field__item[data-highlighted] .ui-dropdown-field__item-row),
	:global(.ui-dropdown-field__item-row[data-selected='true']) {
		background: rgba(168, 85, 247, 0.16);
	}

	:global(.ui-dropdown-field__item-copy) {
		display: grid;
		gap: 0.22rem;
		min-width: 0;
	}

	:global(.ui-dropdown-field__item-label) {
		overflow: hidden;
		color: var(--ui-color-text);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		line-height: 1.1;
		text-overflow: ellipsis;
		text-transform: uppercase;
		white-space: nowrap;
	}

	:global(.ui-dropdown-field__item-meta) {
		overflow: hidden;
		color: var(--ui-color-text-muted);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.ui-dropdown-field__check) {
		color: var(--ui-color-text);
	}
</style>
