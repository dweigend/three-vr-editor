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
			<ChevronDown aria-hidden="true" size={16} />
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
									<Check aria-hidden="true" class="ui-dropdown-field__check" size={16} />
								{/if}
							</div>
						</Item>
					{/each}
				</div>
			</Content>
		</Portal>
	</Root>
</div>
