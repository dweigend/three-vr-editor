/** Public prop types for the conversation-panel block family. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ConversationMessage = {
	id?: string;
	role: 'assistant' | 'user';
	state?: 'error' | 'pending';
	text: string;
};

export type ConversationPanelProps = HTMLAttributes<HTMLElement> & {
	class?: string;
	composer?: Snippet;
	emptyMessage?: string;
	errorMessage?: string | null;
	messages?: ConversationMessage[];
};
