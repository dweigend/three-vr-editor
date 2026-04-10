import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { badgeToneClassByTone } from './badge.svelte';

export type BadgeTone = keyof typeof badgeToneClassByTone;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	children?: Snippet;
	tone?: BadgeTone;
};
