<!--
	Purpose: Provide a minimal chat UI for the server-side Pi demo session.
	Context: This page starts a Pi session and continues a simple dialogue through form posts.
	Responsibility: Render the current transcript, the start button, and the message form.
	Boundaries: The browser never imports Pi SDK modules or accesses secrets directly.
-->

<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import Plus from '@lucide/svelte/icons/plus';
	import Send from '@lucide/svelte/icons/send';
	import Smile from '@lucide/svelte/icons/smile';
	import { Button } from '$lib/components';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const messages = $derived(form?.messages ?? data.messages);
	const sessionReady = $derived(form?.sessionReady ?? data.sessionReady);
	const feedbackClass = $derived(
		form?.status === 'success' ? 'ui-status ui-status--success' : 'ui-status ui-status--danger'
	);
</script>

<svelte:head>
	<title>Pi Chat</title>
</svelte:head>

<section class="ui-chat-screen">
	<div class="ui-chat-log">
		<div class="ui-inline">
			<Button type="submit" form="start-session-form" disabled={sessionReady}>
				{sessionReady ? 'Session ready' : 'Start session'}
			</Button>
			<p class="ui-status">
				Key: {data.hasActiveKey ? 'configured' : 'missing'}.
				Model: {data.configuredModel.name}.
			</p>
		</div>

		{#if form}
			<p class={feedbackClass}>{form.message}</p>
		{/if}

		{#if messages.length === 0}
			<p class="ui-empty-state">No messages yet.</p>
		{:else}
			{#each messages as message, index (`${message.role}-${message.text}-${index}`)}
				<article class="ui-chat-message">
					<div class="ui-chat-message__icon">
						{#if message.role === 'user'}
							<Smile size={22} />
						{:else}
							<Bot size={22} />
						{/if}
					</div>
					<div aria-hidden="true" class="ui-chat-message__rule"></div>
					<div class="ui-chat-message__bubble">
						<pre class="ui-chat-message__body">{message.text}</pre>
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<form action="?/startSession" id="start-session-form" method="POST"></form>

	<form action="?/sendMessage" class="ui-chat-composer" method="POST">
		<button class="ui-chat-composer__button" type="button" disabled aria-label="Attachments unavailable">
			<Plus size={20} />
		</button>

		<div class="ui-chat-composer__field">
			<label class="sr-only" for="message">Message</label>
			<textarea
				class="ui-textarea"
				id="message"
				name="message"
				placeholder={sessionReady ? 'Send a message to Pi.' : 'Start a session to chat with Pi.'}
				disabled={!sessionReady}
			></textarea>
		</div>

		<button class="ui-chat-composer__button ui-chat-composer__button--send" type="submit" disabled={!sessionReady}>
			<Send size={20} />
		</button>
	</form>
</section>
