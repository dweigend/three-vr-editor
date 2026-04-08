<!--
	Purpose: Render a thin Pi editor panel for the Three editor demo.
	Context: The nested `/three/editor/pi` route needs a file-aware assistant surface without embedding Pi SDK logic in the browser.
	Responsibility: Collect prompts, call the server endpoint, render optimistic local turns, and show disabled or error states.
	Boundaries: Pi session creation and prompt execution stay in server-only modules and route handlers.
-->

<script lang="ts">
	import { resolve } from '$app/paths';
	import Bot from '@lucide/svelte/icons/bot';
	import { Button } from '$lib/components';
	import { ConversationPanel, InputBar } from '$lib/blocks';
	import { createConversationState } from '$lib/pi/conversation-state.svelte';
	import { sendEditorAgentRequest } from '$lib/pi/editor-agent-client';

	import type {
		EditorAgentPreviousTurn,
		EditorAgentRequest,
		EditorAgentResponse
	} from '$lib/pi/editor-agent-types';
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
		modelName?: string | null;
		onResponse?: ((event: EditorAgentResponseEvent) => void) | undefined;
	};

	let {
		activeFileContext,
		endpoint = resolve('/three/editor/pi/agent'),
		hasActiveKey,
		modelName = null,
		onResponse
	}: Props = $props();

	let prompt = $state('');
	let isSubmitting = $state(false);
	let turns = $state<EditorAgentTurn[]>([]);
	const conversation = createConversationState();
	let conversationFilePath = $state<string | null>(null);

	const isDisabled = $derived(!hasActiveKey || !activeFileContext || isSubmitting);
	const latestTurn = $derived(turns.at(-1) ?? null);
	const promptPlaceholder = $derived.by(() => {
		if (!hasActiveKey) {
			return 'Configure an OpenRouter key in Settings to use Pi.';
		}

		if (!activeFileContext) {
			return 'Open a file to ask Pi about the current editor context.';
		}

		return 'Ask Pi about the current file or request a targeted change suggestion.';
	});

	$effect(() => {
		const nextFilePath = activeFileContext?.path ?? null;

		if (nextFilePath === conversationFilePath) {
			return;
		}

		conversationFilePath = nextFilePath;
		prompt = '';
		turns = [];
		conversation.reset();
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
				previousTurn: latestTurn ?? undefined,
				prompt: normalizedPrompt
			} satisfies EditorAgentRequest;
			const payload = await sendEditorAgentRequest(endpoint, requestBody);

			conversation.resolveAssistantTurn(pendingAssistantId, payload.answer);
			turns = [
				...turns,
				{
					answer: payload.answer,
					prompt: normalizedPrompt
				}
			];
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
</script>

<section class="ui-pane ui-pane--muted">
	<div class="ui-pane__header">
		<p class="ui-surface-label">Pi agent</p>
		<p class="ui-toolbar-status">{modelName ? modelName : 'No model configured'}</p>
	</div>

	<div class="ui-pane__body ui-pane__body--flush">
		<ConversationPanel
			class="editor-agent-panel__conversation"
			emptyMessage="No local agent turns yet."
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
						{#snippet leading()}
							<span class="editor-agent-panel__lead" aria-hidden="true">
								<Bot aria-hidden="true" size={18} />
							</span>
						{/snippet}

						{#snippet trailing()}
							{#if !hasActiveKey}
								<Button href={resolve('/pi')} size="sm">Open settings</Button>
							{:else}
								<div class="editor-agent-panel__trailing">
									<Button type="submit" disabled={isDisabled || prompt.trim().length === 0}>
										{isSubmitting ? 'Asking Pi...' : 'Ask Pi'}
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

	.editor-agent-panel__lead {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		min-height: 2.4rem;
		color: var(--ui-color-text-subtle);
	}

	.editor-agent-panel__trailing {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
	}

	:global(.editor-agent-panel__composer .input-bar__input) {
		text-transform: none;
		letter-spacing: 0.03em;
	}
</style>
