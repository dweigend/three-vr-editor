import type { Snippet } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

type InputAutocomplete = SvelteHTMLElements['input']['autocomplete'];
type InputEnterKeyHint = SvelteHTMLElements['input']['enterkeyhint'];

export type InputBarProps = SvelteHTMLElements['div'] & {
	ariaLabel?: string;
	autocomplete?: InputAutocomplete;
	class?: string;
	disabled?: boolean;
	enterKeyHint?: InputEnterKeyHint;
	inputClass?: string;
	inputId?: string;
	inputMode?: 'multiline' | 'command';
	inputName?: string;
	leading?: Snippet;
	placeholder?: string;
	readonly?: boolean;
	required?: boolean;
	rows?: number;
	spellcheck?: boolean;
	trailing?: Snippet;
	value?: string;
	variant?: 'command-line' | 'default';
};
