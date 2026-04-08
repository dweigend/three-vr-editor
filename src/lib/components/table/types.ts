/** Public prop types for the table primitive family. */
import type { Snippet } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

export type TableProps = SvelteHTMLElements['div'] & {
	ariaLabel?: string;
	children?: Snippet;
	tableClass?: string;
};

export type TableSectionProps = SvelteHTMLElements['thead'] & {
	children?: Snippet;
};

export type TableBodyProps = SvelteHTMLElements['tbody'] & {
	children?: Snippet;
};

export type TableRowProps = SvelteHTMLElements['tr'] & {
	children?: Snippet;
	selected?: boolean;
};

export type TableHeadProps = SvelteHTMLElements['th'] & {
	children?: Snippet;
};

export type TableCellProps = SvelteHTMLElements['td'] & {
	children?: Snippet;
};
