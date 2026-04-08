/** Public prop types for the dropdown-menu primitive family. */
import type { DropdownMenu, WithElementRef } from 'bits-ui';
import type { HTMLAttributes } from 'svelte/elements';

export type DropdownMenuRootProps = DropdownMenu.RootProps;
export type DropdownMenuTriggerProps = DropdownMenu.TriggerProps;
export type DropdownMenuPortalProps = DropdownMenu.PortalProps;
export type DropdownMenuContentProps = DropdownMenu.ContentProps;
export type DropdownMenuItemProps = DropdownMenu.ItemProps;

export type DropdownFieldOption = {
	disabled?: boolean;
	label: string;
	meta?: string;
	value: string;
};

export type DropdownFieldProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
	ariaLabel?: string;
	contentClass?: string;
	id?: string;
	itemClass?: string;
	name?: string;
	options?: DropdownFieldOption[];
	placeholder?: string;
	sideOffset?: number;
	triggerClass?: string;
	value?: string;
};
