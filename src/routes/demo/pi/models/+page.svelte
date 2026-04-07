<!--
	Purpose: Provide a minimal model settings UI for the Pi demo.
	Context: Users should pick from a fixed OpenRouter shortlist and see the costs and capabilities at a glance.
	Responsibility: Render one selection form and an HTML table of the allowed models.
	Boundaries: The server owns persistence and validation of the selected model.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const selectedModelId = $derived(form?.selectedModelId ?? data.selectedModelId);
</script>

<h1>Pi model settings</h1>
<p><a href={resolve('/demo/pi')}>Key setup</a></p>
<p><a href={resolve('/demo/pi/chat')}>Chat demo</a></p>

<form method="POST">
	<label for="modelId">Active model</label><br />
	<select id="modelId" name="modelId">
		{#each data.models as model}
			<option value={model.id} selected={model.id === selectedModelId}>{model.name}</option>
		{/each}
	</select>
	<button type="submit">Save model</button>
</form>

{#if form}
	<p style={`color: ${form.status === 'success' ? 'green' : 'red'};`}>
		{form.message}
	</p>
{/if}

<table>
	<thead>
		<tr>
			<th>Model</th>
			<th>Input cost</th>
			<th>Output cost</th>
			<th>Context</th>
			<th>Capabilities</th>
			<th>OpenRouter</th>
		</tr>
	</thead>
	<tbody>
		{#each data.models as model}
			<tr>
				<td>{model.name}</td>
				<td>{model.inputCost}</td>
				<td>{model.outputCost}</td>
				<td>{model.contextWindow}</td>
				<td>{model.capabilities.join(', ')}</td>
				<td><a href={model.openRouterUrl} target="_blank" rel="noreferrer">{model.id}</a></td>
			</tr>
		{/each}
	</tbody>
</table>

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
