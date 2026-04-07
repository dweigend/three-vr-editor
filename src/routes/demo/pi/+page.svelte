<!--
	Purpose: Provide a minimal OpenRouter key management page for the Pi demo.
	Context: Users can validate and store multiple keys, then see and manage the configured list.
	Responsibility: Render one add-key form plus a simple table of stored keys and actions.
	Boundaries: Pi SDK code stays server-side; this page only submits forms and renders results.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const keys = $derived(form?.keys ?? data.keys);
	const hasActiveKey = $derived(keys.some((key) => key.isActive) || data.hasActiveKey);
</script>

<h1>Pi key setup</h1>
<p><a href={resolve('/demo')}>Back to demos</a></p>
<p><a href={resolve('/demo/pi/chat')}>Chat demo</a></p>
<p><a href={resolve('/demo/pi/models')}>Model settings</a></p>

<p>Active OpenRouter key configured: {hasActiveKey ? 'yes' : 'no'}</p>

<form method="POST" action="?/addKey">
	<label for="apiKey">OpenRouter API key</label><br />
	<input id="apiKey" name="apiKey" type="password" autocomplete="off" spellcheck="false" />
	<br />
	<button type="submit">Validate and store key</button>
</form>

{#if form}
	<p style={`color: ${form.status === 'success' ? 'green' : 'red'};`}>
		{form.message}
	</p>
{/if}

<h2>Stored keys</h2>

{#if keys.length === 0}
	<p>No keys stored yet.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Key</th>
				<th>Active</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each keys as key}
				<tr>
					<td>{key.maskedKey}</td>
					<td>{key.isActive ? 'yes' : 'no'}</td>
					<td>
						<form method="POST" action="?/activateKey" style="display: inline;">
							<input type="hidden" name="keyId" value={key.id} />
							<button type="submit" disabled={key.isActive}>Use</button>
						</form>
						<form method="POST" action="?/deleteKey" style="display: inline;">
							<input type="hidden" name="keyId" value={key.id} />
							<button type="submit">Delete</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	table {
		border-collapse: collapse;
		margin-top: 1rem;
	}

	th,
	td {
		border: 1px solid #999;
		padding: 0.4rem;
		text-align: left;
		vertical-align: top;
	}

	form {
		margin-bottom: 1rem;
	}
 </style>
