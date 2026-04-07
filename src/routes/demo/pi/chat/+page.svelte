<!--
	Purpose: Provide a minimal chat UI for the server-side Pi demo session.
	Context: This page starts a Pi session and continues a simple dialogue through form posts.
	Responsibility: Render the current transcript, the start button, and the message form.
	Boundaries: The browser never imports Pi SDK modules or accesses secrets directly.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const messages = $derived(form?.messages ?? data.messages);
	const sessionReady = $derived(form?.sessionReady ?? data.sessionReady);
</script>

<h1>Pi chat demo</h1>
<p><a href={resolve('/demo/pi')}>Key setup</a></p>
<p><a href={resolve('/demo/pi/models')}>Model settings</a></p>

<p>Active key configured: {data.hasActiveKey ? 'yes' : 'no'}</p>
<p>Configured model: {data.configuredModel.name}</p>

<form method="POST" action="?/startSession">
	<button type="submit">Start Session</button>
</form>

{#if form}
	<p style={`color: ${form.status === 'success' ? 'green' : 'red'};`}>
		{form.message}
	</p>
{/if}

{#if sessionReady}
	<form method="POST" action="?/sendMessage">
		<label for="message">Message</label><br />
		<textarea id="message" name="message" rows="6" cols="80"></textarea>
		<br />
		<button type="submit">Send</button>
	</form>
{:else}
	<p>Start a session to chat with Pi.</p>
{/if}

<h2>Conversation</h2>

{#if messages.length === 0}
	<p>No messages yet.</p>
{:else}
	<div>
		{#each messages as message}
			<div style="border: 1px solid #999; margin-bottom: 0.75rem; padding: 0.5rem;">
				<strong>{message.role === 'user' ? 'You' : 'Pi'}</strong>
				<pre style="white-space: pre-wrap; margin: 0.5rem 0 0;">{message.text}</pre>
			</div>
		{/each}
	</div>
{/if}
