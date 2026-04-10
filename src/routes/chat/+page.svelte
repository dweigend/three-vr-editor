<script lang="ts">
	import { untrack } from 'svelte';

	import Power from '@lucide/svelte/icons/power';

	import { IconButton } from '$lib/components';
	import { ConversationPanel, InputBar } from '$lib/blocks';
	import { sendPiChatMessageClient, startPiChatSessionClient } from '$lib/features/chat/chat-client';
	import { createConversationState } from '$lib/features/chat/conversation-state.svelte';

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
	<title>Chat</title>
</svelte:head>

<section class="ui-screen ui-screen--fill">
	<ConversationPanel
		class="ui-chat-screen__conversation"
		emptyMessage="No messages."
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
							<span aria-hidden="true" class="ui-command-prompt">&gt;</span>
						{:else}
							<IconButton
								ariaLabel="Start session"
								disabled={!hasActiveKey || isStartingSession || isSending}
								onclick={() => {
									void handleStartSession();
								}}
							>
								{#snippet children()}
									<Power aria-hidden="true" size={16} />
								{/snippet}
							</IconButton>
						{/if}
					{/snippet}
				</InputBar>
			</form>
		{/snippet}
	</ConversationPanel>
</section>
