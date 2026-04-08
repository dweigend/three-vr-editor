/** Public prop types for the settings-section block family. */
import type { Snippet } from 'svelte';

export type SettingsSectionProps = {
	children?: Snippet;
	class?: string;
	headerActions?: Snippet;
	icon?: Snippet;
	meta?: string;
	title: string;
};
