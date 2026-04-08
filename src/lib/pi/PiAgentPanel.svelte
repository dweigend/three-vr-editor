<!--
	Purpose: Render a thin Pi agent panel for the Three editor demo.
	Context: The editor-agent route needs a file-aware assistant surface without embedding Pi SDK logic in the browser.
	Responsibility: Collect prompts, call the server endpoint, render local turns, and show disabled or error states.
	Boundaries: Pi session creation and prompt execution stay in server-only modules and route handlers.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import type {
		PiEditorAgentPreviousTurn,
		PiEditorAgentRequest,
		PiEditorAgentResponse
	} from '$lib/pi/pi-editor-agent-types';
	import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';

	type PiAgentPanelTurn = PiEditorAgentPreviousTurn;
	type PiAgentPanelResponseEvent = {
		request: PiEditorAgentRequest;
		response: PiEditorAgentResponse;
	};

	type Props = {
		activeFileContext: ThreeEditorActiveFileContext | null;
		endpoint?: string;
		hasActiveKey: boolean;
		modelName?: string | null;
		onResponse?: ((event: PiAgentPanelResponseEvent) => void) | undefined;
	};

	let {
		activeFileContext,
		endpoint = resolve('/demo/three/editor-agent/agent'),
		hasActiveKey,
		modelName = null,
		onResponse
	}: Props = $props();

	let prompt = $state('');
	let errorMessage = $state<string | null>(null);
	let isSubmitting = $state(false);
	let turns = $state<PiAgentPanelTurn[]>([]);

	const isDisabled = $derived(!hasActiveKey || !activeFileContext || isSubmitting);
	const latestTurn = $derived(turns.at(-1) ?? null);

	async function submitPrompt(): Promise<void> {
		const normalizedPrompt = prompt.trim();

		if (!activeFileContext || normalizedPrompt.length === 0 || isSubmitting) {
			return;
		}

		isSubmitting = true;
		errorMessage = null;

		try {
			const requestBody = {
				file: activeFileContext,
				previousTurn: latestTurn ?? undefined,
				prompt: normalizedPrompt
			} satisfies PiEditorAgentRequest;
			const response = await fetch(endpoint, {
				body: JSON.stringify(requestBody),
				headers: {
					'content-type': 'application/json'
				},
				method: 'POST'
			});

			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(errorPayload?.message ?? 'Pi request failed.');
			}

			const payload = (await response.json()) as PiEditorAgentResponse;

			turns = [
				...turns,
				{
					answer: payload.answer,
					prompt: normalizedPrompt
				}
			];
			prompt = '';
			onResponse?.({
				request: requestBody,
				response: payload
			});
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Pi request failed.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="panel">
	<h2>Pi agent panel</h2>

	{#if modelName}
		<p>Configured model: {modelName}</p>
	{/if}

	{#if !activeFileContext}
		<p>Waiting for the active file context.</p>
	{:else}
		<p>Active file: <code>{activeFileContext.path}</code></p>
		<p>Editor state: {activeFileContext.isDirty ? 'unsaved changes' : 'saved'}</p>
	{/if}

	{#if !hasActiveKey}
		<p>Pi is disabled until an OpenRouter key is configured.</p>
		<p><a href={resolve('/demo/pi')}>Open Pi key setup</a></p>
		<p><a href={resolve('/demo/pi/models')}>Open Pi model settings</a></p>
	{:else}
		<label class="field">
			<span>Question for Pi</span>
			<textarea
				bind:value={prompt}
				rows="8"
				placeholder="Ask about the active file, explain code, or request a targeted change suggestion."
				disabled={!activeFileContext || isSubmitting}
			></textarea>
		</label>

		<div class="actions">
			<button type="button" onclick={submitPrompt} disabled={isDisabled || prompt.trim().length === 0}>
				{isSubmitting ? 'Asking Pi...' : 'Ask Pi'}
			</button>
		</div>
	{/if}

	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}

	<h3>Conversation</h3>

	{#if turns.length === 0}
		<p>No local agent turns yet.</p>
	{:else}
		<div class="turns">
			{#each turns as turn}
				<article class="turn">
					<strong>You</strong>
					<pre>{turn.prompt}</pre>
					<strong>Pi</strong>
					<pre>{turn.answer}</pre>
				</article>
			{/each}
		</div>
	{/if}
</section>

<style>
	.panel {
		border: 1px solid #d4d4d8;
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.field {
		display: grid;
		gap: 0.5rem;
	}

	.field textarea {
		font: inherit;
		min-height: 10rem;
		padding: 0.75rem;
		width: 100%;
	}

	.actions {
		margin-top: 0.75rem;
	}

	.error {
		color: #b91c1c;
	}

	.turns {
		display: grid;
		gap: 0.75rem;
	}

	.turn {
		border: 1px solid #e4e4e7;
		border-radius: 0.5rem;
		padding: 0.75rem;
	}

	.turn pre {
		margin: 0.5rem 0 0.75rem;
		white-space: pre-wrap;
	}
</style>
