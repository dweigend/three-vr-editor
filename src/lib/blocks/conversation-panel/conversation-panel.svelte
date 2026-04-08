<!--
	Purpose: Render a shared transcript-and-composer layout for chat-style interactions.
	Context: Standalone Pi chat and the embedded editor agent should reuse the same conversation shell instead of maintaining parallel transcript CSS.
	Responsibility: Render messages with safe Markdown, keep the composer pinned to the bottom, and own transcript scrolling.
	Boundaries: This block does not fetch messages, submit prompts, or decide feature-specific composer controls.
-->

<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import Smile from '@lucide/svelte/icons/smile';

	import { joinClassNames } from '$lib/utils/class-names';
	import { renderMarkdownToHtml } from '$lib/utils/markdown';

	import type { ConversationPanelProps } from './types';

	let {
		children,
		class: className = '',
		composer,
		emptyMessage = 'No messages yet.',
		errorMessage = null,
		messages = [],
		...restProps
	}: ConversationPanelProps = $props();

	const messageCount = $derived(messages.length);
	const scrollSignature = $derived(
		messages
			.map((message, index) => `${message.id ?? index}:${message.role}:${message.state ?? 'ready'}:${message.text}`)
			.join('|')
	);

	let logElement = $state<HTMLDivElement | null>(null);

	$effect(() => {
		messageCount;
		scrollSignature;
		errorMessage;

		if (!logElement) {
			return;
		}

		requestAnimationFrame(() => {
			if (!logElement) {
				return;
			}

			logElement.scrollTop = logElement.scrollHeight;
		});
	});
</script>

<section {...restProps} class={joinClassNames('conversation-panel', className)}>
	<div bind:this={logElement} class="conversation-panel__log">
		{#if errorMessage}
			<p class="ui-status ui-status--danger">{errorMessage}</p>
		{/if}

		{#if messages.length === 0}
			<p class="ui-empty-state">{emptyMessage}</p>
		{:else}
			{#each messages as message, index (message.id ?? `${message.role}-${message.text}-${index}`)}
				<article
					class="conversation-panel__message"
					data-role={message.role}
					data-state={message.state ?? 'ready'}
				>
					<div class="conversation-panel__icon">
						{#if message.role === 'user'}
							<Smile aria-hidden="true" size={18} />
						{:else}
							<Bot aria-hidden="true" size={18} />
						{/if}
					</div>
					<div class="conversation-panel__bubble">
						{#if message.state === 'pending'}
							<div aria-label="Assistant is working" class="conversation-panel__pending" role="status">
								<span></span>
								<span></span>
								<span></span>
							</div>
						{:else}
							<div class="conversation-panel__body conversation-panel__markdown">
								{@html renderMarkdownToHtml(message.text)}
							</div>
						{/if}
					</div>
				</article>
			{/each}
		{/if}
	</div>

	{#if composer}
		<div class="conversation-panel__composer">
			{@render composer()}
		</div>
	{/if}

	{@render children?.()}
</section>

<style>
	.conversation-panel {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		gap: 0;
		height: 100%;
		min-height: 0;
		padding: 0;
		overflow: hidden;
	}

	.conversation-panel__log {
		display: grid;
		gap: 0.95rem;
		align-content: start;
		min-height: 0;
		overflow-y: auto;
		padding: var(--ui-space-4);
		scrollbar-gutter: stable;
	}

	.conversation-panel__message {
		display: grid;
		grid-template-columns: 1.45rem minmax(0, 1fr);
		column-gap: 0.85rem;
		row-gap: 0;
		width: 100%;
		max-width: 100%;
		align-items: start;
	}

	.conversation-panel__icon {
		display: inline-flex;
		align-items: flex-start;
		justify-content: center;
		width: 1.45rem;
		padding-top: 0.72rem;
		color: var(--ui-color-text-muted);
	}

	.conversation-panel__message[data-role='assistant'] .conversation-panel__icon {
		color: rgba(113, 240, 154, 0.92);
	}

	.conversation-panel__bubble {
		width: 100%;
		min-width: 0;
		padding: 0.72rem 0.9rem;
		background: rgba(255, 255, 255, 0.04);
	}

	.conversation-panel__message[data-role='assistant'] .conversation-panel__bubble {
		background: rgba(255, 255, 255, 0.055);
	}

	.conversation-panel__message[data-role='assistant'][data-state='error'] .conversation-panel__bubble {
		background: rgba(251, 113, 133, 0.1);
	}

	.conversation-panel__message[data-role='user'] .conversation-panel__bubble {
		width: fit-content;
		max-width: min(100%, 24rem);
	}

	.conversation-panel__body {
		margin: 0;
		color: var(--ui-color-text);
		font-size: 0.92rem;
		line-height: 1.62;
		word-break: break-word;
	}

	.conversation-panel__pending {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 1.6rem;
	}

	.conversation-panel__pending span {
		width: 0.42rem;
		height: 0.42rem;
		border-radius: 999px;
		background: var(--ui-color-text-subtle);
		animation: conversation-panel-pulse 1s ease-in-out infinite;
	}

	.conversation-panel__pending span:nth-child(2) {
		animation-delay: 120ms;
	}

	.conversation-panel__pending span:nth-child(3) {
		animation-delay: 240ms;
	}

	.conversation-panel__markdown :global(*) {
		box-sizing: border-box;
	}

	.conversation-panel__markdown :global(h1),
	.conversation-panel__markdown :global(h2),
	.conversation-panel__markdown :global(h3),
	.conversation-panel__markdown :global(h4),
	.conversation-panel__markdown :global(h5),
	.conversation-panel__markdown :global(h6),
	.conversation-panel__markdown :global(p),
	.conversation-panel__markdown :global(ul),
	.conversation-panel__markdown :global(ol),
	.conversation-panel__markdown :global(pre) {
		margin: 0;
	}

	.conversation-panel__markdown :global(* + h1),
	.conversation-panel__markdown :global(* + h2),
	.conversation-panel__markdown :global(* + h3),
	.conversation-panel__markdown :global(* + h4),
	.conversation-panel__markdown :global(* + h5),
	.conversation-panel__markdown :global(* + h6),
	.conversation-panel__markdown :global(* + p),
	.conversation-panel__markdown :global(* + ul),
	.conversation-panel__markdown :global(* + ol),
	.conversation-panel__markdown :global(* + pre) {
		margin-top: 0.9rem;
	}

	.conversation-panel__markdown :global(h1),
	.conversation-panel__markdown :global(h2) {
		font-size: 1rem;
		line-height: 1.3;
	}

	.conversation-panel__markdown :global(h3),
	.conversation-panel__markdown :global(h4),
	.conversation-panel__markdown :global(h5),
	.conversation-panel__markdown :global(h6) {
		font-size: 0.95rem;
		line-height: 1.35;
	}

	.conversation-panel__markdown :global(ul),
	.conversation-panel__markdown :global(ol) {
		padding-left: 1.35rem;
	}

	.conversation-panel__markdown :global(li + li) {
		margin-top: 0.35rem;
	}

	.conversation-panel__markdown :global(code) {
		padding: 0.1rem 0.32rem;
		background: rgba(255, 255, 255, 0.08);
		font-family: var(--ui-font-mono);
		font-size: 0.9em;
	}

	.conversation-panel__markdown :global(pre) {
		overflow-x: auto;
		padding: 0.9rem 1rem;
		background: rgba(0, 0, 0, 0.32);
	}

	.conversation-panel__markdown :global(pre code) {
		display: block;
		padding: 0;
		background: transparent;
		line-height: 1.6;
	}

	.conversation-panel__markdown :global(a) {
		color: var(--ui-color-accent-strong);
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}

	.conversation-panel__composer {
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		padding: 0.55rem var(--ui-space-4) var(--ui-space-4);
		background:
			linear-gradient(
				180deg,
				rgba(6, 6, 10, 0) 0%,
				rgba(6, 6, 10, 0.9) 24%,
				rgba(6, 6, 10, 0.98) 100%
			);
	}

	@media (max-width: 720px) {
		.conversation-panel__log {
			padding: 0.9rem;
		}

		.conversation-panel__composer {
			padding: 0.55rem 0.9rem 0.9rem;
		}

		.conversation-panel__message[data-role='user'] .conversation-panel__bubble {
			max-width: 100%;
		}
	}

	@keyframes conversation-panel-pulse {
		0%,
		80%,
		100% {
			opacity: 0.32;
			transform: translateY(0);
		}

		40% {
			opacity: 1;
			transform: translateY(-1px);
		}
	}
</style>
