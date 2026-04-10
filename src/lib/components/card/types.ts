import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	children?: Snippet;
};

export type CardSectionProps = CardProps;
