<!--
	Purpose: Provide a minimal chat UI for the server-side Pi demo session.
	Context: This page hydrates the persisted transcript and then continues the dialogue with immediate optimistic client-side updates.
	Responsibility: Render the current transcript, clear the input immediately on submit, and show Pi working state while the backend responds.
	Boundaries: The browser never imports Pi SDK modules or accesses secrets directly.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import Power from '@lucide/svelte/icons/power';
	import { IconButton } from '$lib/components';
	import { ConversationPanel, InputBar } from '$lib/blocks';
	import { sendPiChatMessageClient, startPiChatSessionClient } from '$lib/pi/chat-client';
	import { createConversationState } from '$lib/pi/conversation-state.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const initialData = untrack(() => data);
	const hasActiveKey = initialData.hasActiveKey;
	const initialMessages = initialData.messages;
	const initialSessionReady = initialData.sessionReady;

	const conversation = createConversationState(initialMessages);

	let prompt = $state('');
	let sessionReady = $state(initialSessionReady);
	let isStartingSession = $state(false);
	let isSending = $state(false);

	const isComposerDisabled = $derived(!hasActiveKey || isStartingSession || isSending);
	const placeholder = $derived.by(() => {
		if (!hasActiveKey) {
			return 'Configure a key in Settings, then start a Pi session.';
		}

		if (sessionReady) {
			return 'Enter message...';
		}

		return 'Send a message to start a Pi session.';
	});
	function toErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : 'Pi request failed.';
	}

	async function startSession(): Promise<boolean> {
		if (sessionReady) {
			return true;
		}

		if (!hasActiveKey || isStartingSession) {
			return false;
		}

		isStartingSession = true;
		conversation.clearError();

		try {
			const payload = await startPiChatSessionClient();
			sessionReady = payload.sessionReady;
			conversation.setMessages(payload.messages);

			return true;
		} catch (error) {
			conversation.setError(toErrorMessage(error));
			return false;
		} finally {
			isStartingSession = false;
		}
	}

	async function handleStartSession(): Promise<void> {
		await startSession();
	}

	async function handleSubmit(): Promise<void> {
		const normalizedPrompt = prompt.trim();

		if (!hasActiveKey || normalizedPrompt.length === 0 || isSending || isStartingSession) {
			return;
		}

		const optimisticPrompt = normalizedPrompt;
		const pendingAssistantId = conversation.beginAssistantTurn(optimisticPrompt);
		prompt = '';
		isSending = true;

		try {
			const payload = await sendPiChatMessageClient(optimisticPrompt);
			sessionReady = payload.sessionReady;
			conversation.setMessages(payload.messages);
		} catch (error) {
			conversation.failAssistantTurn(pendingAssistantId, toErrorMessage(error));
		} finally {
			isSending = false;
		}
	}
</script>

<svelte:head>
	<title>Pi Chat</title>
</svelte:head>

<section class="ui-screen ui-screen--fill">
	<ConversationPanel
		class="ui-chat-screen__conversation"
		emptyMessage="No messages yet."
		errorMessage={conversation.errorMessage}
		messages={conversation.messages}
	>
		{#snippet composer()}
			<form
				method="POST"
				onsubmit={(event) => {
					event.preventDefault();
					void handleSubmit();
				}}
			>
				<InputBar
					bind:value={prompt}
					ariaLabel="Message"
					autocomplete="off"
					disabled={isComposerDisabled}
					enterKeyHint="send"
					inputId="message"
					inputMode="command"
					inputName="message"
					{placeholder}
					spellcheck={false}
					variant="command-line"
				>
					{#snippet leading()}
						{#if sessionReady}
							<span class="ui-chat-command-line__prompt" aria-hidden="true">&gt;</span>
						{:else}
							<IconButton
								ariaLabel="Start session"
								disabled={!hasActiveKey || isStartingSession || isSending}
								onclick={() => {
									void handleStartSession();
								}}
							>
								{#snippet children()}
									<Power aria-hidden="true" size={18} />
								{/snippet}
							</IconButton>
						{/if}
					{/snippet}
				</InputBar>
			</form>
		{/snippet}
	</ConversationPanel>
</section>

<style>
	.ui-chat-command-line__prompt {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--ui-font-mono);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ui-color-text-subtle);
		white-space: nowrap;
		width: 1.5rem;
	}
</style>
