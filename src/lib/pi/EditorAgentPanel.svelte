<!--
	Purpose: Render a thin Pi editor panel for the Three editor demo.
	Context: The nested `/three/editor/pi` route needs a file-aware assistant surface without embedding Pi SDK logic in the browser.
	Responsibility: Collect prompts, call the server endpoint, render local turns, and show disabled or error states.
	Boundaries: Pi session creation and prompt execution stay in server-only modules and route handlers.
-->

<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components';

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
	let errorMessage = $state<string | null>(null);
	let isSubmitting = $state(false);
	let turns = $state<EditorAgentTurn[]>([]);

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
			} satisfies EditorAgentRequest;
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

			const payload = (await response.json()) as EditorAgentResponse;

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

<section class="ui-pane ui-pane--muted">
	<div class="ui-pane__header">
		<p class="ui-surface-label">Pi agent</p>
		<p class="ui-toolbar-status">{modelName ? modelName : 'No model configured'}</p>
	</div>

	<div class="ui-pane__body ui-pane__body--scroll">
		<div class="ui-form-grid">
			<div class="ui-stack ui-stack--tight">
				{#if !activeFileContext}
					<p class="ui-status">Waiting for the active file context.</p>
				{:else}
					<p class="ui-status">Active file: {activeFileContext.path}</p>
					<p class="ui-status">
						Editor state: {activeFileContext.isDirty ? 'unsaved changes' : 'saved'}
					</p>
				{/if}
			</div>

			{#if !hasActiveKey}
				<div class="ui-form-grid">
					<p class="ui-status ui-status--danger">
						Pi stays disabled until an OpenRouter key is configured.
					</p>
					<div class="ui-inline">
						<Button href={resolve('/pi')} size="sm">Keys</Button>
						<Button href={resolve('/pi/models')} size="sm" variant="ghost">Models</Button>
					</div>
				</div>
			{:else}
				<div class="ui-form-grid">
					<label class="ui-form-row">
						<span class="ui-form-label">Question for Pi</span>
						<textarea
							bind:value={prompt}
							class="ui-textarea"
							rows="6"
							placeholder="Ask about the active file, explain code, or request a targeted change suggestion."
							disabled={!activeFileContext || isSubmitting}
						></textarea>
					</label>

					<div class="ui-inline">
						<Button type="button" onclick={submitPrompt} disabled={isDisabled || prompt.trim().length === 0}>
							{isSubmitting ? 'Asking Pi...' : 'Ask Pi'}
						</Button>
					</div>
				</div>
			{/if}

			{#if errorMessage}
				<p class="ui-status ui-status--danger">{errorMessage}</p>
			{/if}

			<div class="ui-stack ui-stack--tight">
				<p class="ui-surface-label">Conversation</p>

				{#if turns.length === 0}
					<p class="ui-empty-state">No local agent turns yet.</p>
				{:else}
					<div class="ui-panel-list">
						{#each turns as turn (`${turn.prompt}-${turn.answer}`)}
							<article class="ui-message">
								<div class="ui-message__role">You</div>
								<pre class="ui-message__body">{turn.prompt}</pre>
								<div class="ui-message__role">Pi</div>
								<pre class="ui-message__body">{turn.answer}</pre>
							</article>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
