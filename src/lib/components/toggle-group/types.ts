type ToggleGroupOption = {
	label: string;
	value: string;
};

export type ToggleGroupProps = {
	options?: readonly ToggleGroupOption[];
	value?: string;
};
