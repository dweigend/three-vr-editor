/** Public prop types for the app-launcher block family. */
import type { Snippet } from 'svelte';

export type AppLauncherItem = {
	href: string;
	title: string;
	description: string;
	actionLabel?: string;
	kicker?: string;
	meta?: string;
};

export type AppLauncherProps = {
	children?: Snippet;
	class?: string;
	description?: string;
	items: AppLauncherItem[];
	kicker?: string;
	title: string;
};
