<!--
	Purpose: Render the Pi editor panel with explicit one-shot and session modes.
	Context: The editor surface needs a file-aware assistant without embedding Pi SDK logic in the browser.
	Responsibility: Collect prompts, manage local conversation state per mode, and call the server endpoint.
	Boundaries: Pi session creation and persistence stay in server-only modules and route handlers.
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components';
	import { ConversationPanel, InputBar } from '$lib/blocks';
	import { createConversationState } from '$lib/pi/conversation-state.svelte';
	import { clearEditorAgentSession, sendEditorAgentRequest } from '$lib/pi/editor-agent-client';

	import type {
		EditorAgentMode,
		EditorAgentPreviousTurn,
		EditorAgentRequest,
		EditorAgentResponse
	} from '$lib/pi/editor-agent-types';
	import type { PiChatConversationMessage } from '$lib/pi/chat-types';
	import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';

	type EditorAgentTurn = EditorAgentPreviousTurn;
	type EditorAgentResponseEvent = {
		request: EditorAgentRequest;
		response: EditorAgentResponse;
	};

	type Props = {
		activeFileContext: ThreeEditorActiveFileContext | null;
		endpoint?: string;
		hasActiveKey: boolean;
		initialMessages?: PiChatConversationMessage[];
		initialSessionReady?: boolean;
		modelName?: string | null;
		onResponse?: ((event: EditorAgentResponseEvent) => void) | undefined;
	};

	let {
		activeFileContext,
		endpoint = resolve('/three/editor/pi/agent'),
		hasActiveKey,
		initialMessages = [],
		initialSessionReady = false,
		modelName = null,
		onResponse
	}: Props = $props();
	const stableInitialMessages = untrack(() => initialMessages);
	const stableInitialSessionReady = untrack(() => initialSessionReady);
	const stableInitialMode = stableInitialSessionReady ? 'session' : 'one-shot';

	let prompt = $state('');
	let isSubmitting = $state(false);
	let isResettingSession = $state(false);
	let mode = $state<EditorAgentMode>(stableInitialMode);
	let turns = $state<EditorAgentTurn[]>([]);
	let lastMode = $state<EditorAgentMode>(stableInitialMode);
	let hasPersistedSession = $state(stableInitialSessionReady);
	let sessionMessagesCache = $state<PiChatConversationMessage[]>([...stableInitialMessages]);
	const conversation = createConversationState(stableInitialMessages);
	let conversationFilePath = $state<string | null>(null);

	const isDisabled = $derived(!hasActiveKey || !activeFileContext || isSubmitting || isResettingSession);
	const latestTurn = $derived(turns.at(-1) ?? null);
	const emptyMessage = $derived(
		mode === 'session' ? 'No editor session messages yet.' : 'No local agent turns yet.'
	);
	const modeStatus = $derived.by(() => {
		if (mode === 'session') {
			return hasPersistedSession ? 'Session mode' : 'Session mode (new)';
		}

		return 'One-shot mode';
	});
	const promptPlaceholder = $derived.by(() => {
		if (!hasActiveKey) {
			return 'Configure an OpenRouter key in Settings to use Pi.';
		}

		if (!activeFileContext) {
			return 'Open a file to ask Pi about the current editor context.';
		}

		if (mode === 'session') {
			return 'Continue the editor session.';
		}

		return 'Ask Pi about the current file.';
	});

	$effect(() => {
		const nextFilePath = activeFileContext?.path ?? null;

		if (nextFilePath === conversationFilePath) {
			return;
		}

		conversationFilePath = nextFilePath;
		prompt = '';

		if (mode === 'one-shot') {
			turns = [];
			conversation.reset();
		}
	});

	$effect(() => {
		if (mode === lastMode) {
			return;
		}

		lastMode = mode;
		prompt = '';
		conversation.clearError();

		if (mode === 'session') {
			turns = [];
			conversation.setMessages(sessionMessagesCache);
			return;
		}

		conversation.reset();
		turns = [];
	});

	async function submitPrompt(): Promise<void> {
		const normalizedPrompt = prompt.trim();

		if (!activeFileContext || normalizedPrompt.length === 0 || isSubmitting) {
			return;
		}

		const pendingAssistantId = conversation.beginAssistantTurn(normalizedPrompt);
		prompt = '';
		isSubmitting = true;
		conversation.clearError();

		try {
			const requestBody = {
				file: activeFileContext,
				mode,
				previousTurn: mode === 'one-shot' ? latestTurn ?? undefined : undefined,
				prompt: normalizedPrompt
			} satisfies EditorAgentRequest;
			const payload = await sendEditorAgentRequest(endpoint, requestBody);

			if (mode === 'session') {
				hasPersistedSession = payload.sessionReady;
				sessionMessagesCache = [...payload.messages];
				conversation.setMessages(payload.messages);
				turns = [];
			} else {
				conversation.resolveAssistantTurn(pendingAssistantId, payload.answer);
				turns = [
					...turns,
					{
						answer: payload.answer,
						prompt: normalizedPrompt
					}
				];
			}

			onResponse?.({
				request: requestBody,
				response: payload
			});
		} catch (error) {
			conversation.failAssistantTurn(
				pendingAssistantId,
				error instanceof Error ? error.message : 'Pi request failed.'
			);
		} finally {
			isSubmitting = false;
		}
	}

	async function resetSession(): Promise<void> {
		if (isResettingSession) {
			return;
		}

		isResettingSession = true;
		conversation.clearError();

		try {
			await clearEditorAgentSession(endpoint);
			hasPersistedSession = false;
			sessionMessagesCache = [];
			turns = [];

			if (mode === 'session') {
				conversation.reset();
			}
		} catch (error) {
			conversation.setError(
				error instanceof Error ? error.message : 'Could not clear the editor session.'
			);
		} finally {
			isResettingSession = false;
		}
	}
</script>

<section class="ui-pane ui-pane--muted">
	<div class="ui-pane__header">
		<div>
			<p class="ui-surface-label">Pi agent</p>
			<p class="ui-toolbar-status">
				{modelName ? `${modelName} | ${modeStatus}` : 'No model configured'}
			</p>
		</div>

		<div class="editor-agent-panel__header-actions">
			<div aria-label="Pi mode" class="editor-agent-panel__mode-toggle" role="group">
				<Button
					size="sm"
					type="button"
					variant={mode === 'one-shot' ? 'primary' : 'ghost'}
					onclick={() => {
						mode = 'one-shot';
					}}
				>
					{#snippet children()}One-shot{/snippet}
				</Button>
				<Button
					size="sm"
					type="button"
					variant={mode === 'session' ? 'primary' : 'ghost'}
					onclick={() => {
						mode = 'session';
					}}
				>
					{#snippet children()}Session{/snippet}
				</Button>
			</div>

			{#if mode === 'session'}
				<Button
					disabled={!hasPersistedSession || isResettingSession}
					size="sm"
					type="button"
					variant="secondary"
					onclick={() => {
						void resetSession();
					}}
				>
					{#snippet children()}
						{isResettingSession ? 'Resetting...' : 'New session'}
					{/snippet}
				</Button>
			{/if}
		</div>
	</div>

	<div class="ui-pane__body ui-pane__body--flush">
		<ConversationPanel
			class="editor-agent-panel__conversation"
			{emptyMessage}
			errorMessage={conversation.errorMessage}
			messages={conversation.messages}
		>
			{#snippet composer()}
				<form class="editor-agent-panel__composer" onsubmit={(event) => {
					event.preventDefault();
					void submitPrompt();
				}}>
					<InputBar
						bind:value={prompt}
						ariaLabel="Question for Pi"
						disabled={isDisabled}
						enterKeyHint="send"
						inputMode="command"
						placeholder={promptPlaceholder}
						spellcheck={false}
						variant="command-line"
					>
						{#snippet trailing()}
							{#if !hasActiveKey}
								<Button href={resolve('/pi')} size="sm">Open settings</Button>
							{:else}
								<div class="editor-agent-panel__trailing">
									<Button type="submit" disabled={isDisabled || prompt.trim().length === 0}>
										{isSubmitting ? 'Asking Pi...' : mode === 'session' ? 'Send' : 'Ask Pi'}
									</Button>
								</div>
							{/if}
						{/snippet}
					</InputBar>
				</form>
			{/snippet}
		</ConversationPanel>
	</div>
</section>

<style>
	:global(.editor-agent-panel__conversation) {
		height: 100%;
		min-height: 0;
	}

	.editor-agent-panel__composer {
		width: 100%;
	}

	.editor-agent-panel__header-actions {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ui-space-2);
	}

	.editor-agent-panel__mode-toggle,
	.editor-agent-panel__trailing {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-2);
	}

	:global(.editor-agent-panel__composer .input-bar__input) {
		text-transform: none;
		letter-spacing: 0.02em;
	}
</style>
