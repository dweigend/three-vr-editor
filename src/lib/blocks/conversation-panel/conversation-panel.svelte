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
		emptyMessage = 'No messages.',
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
							<Smile aria-hidden="true" size={16} />
						{:else}
							<Bot aria-hidden="true" size={16} />
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
