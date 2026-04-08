<!--
	Purpose: Provide a minimal model settings UI for the Pi demo.
	Context: Users should pick from a fixed OpenRouter shortlist and see the costs and capabilities at a glance.
	Responsibility: Render one selection form and an HTML table of the allowed models.
	Boundaries: The server owns persistence and validation of the selected model.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import { Button } from '$lib/components';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const selectedModelId = $derived(form?.selectedModelId ?? data.selectedModelId);
	const feedbackClass = $derived(
		form?.status === 'success' ? 'ui-status ui-status--success' : 'ui-status ui-status--danger'
	);
</script>

<svelte:head>
	<title>Model Settings</title>
</svelte:head>

<section class="ui-settings-screen">
	<section class="ui-pane">
		<div class="ui-pane__header">
			<p class="ui-surface-label">Models</p>
			<Button href={resolve('/pi')} size="sm" variant="ghost">Keys</Button>
		</div>
		<div class="ui-pane__body">
			<form class="ui-form-grid" method="POST">
				<div class="ui-form-row">
					<label class="ui-form-label" for="modelId">Active model</label>
					<select class="ui-select" id="modelId" name="modelId">
						{#each data.models as model (model.id)}
							<option value={model.id} selected={model.id === selectedModelId}>{model.name}</option>
						{/each}
					</select>
				</div>

				<div class="ui-inline">
					<Button type="submit">Save model</Button>
				</div>
			</form>

			{#if form}
				<p class={feedbackClass}>{form.message}</p>
			{/if}
		</div>
	</section>

	<section class="ui-pane">
		<div class="ui-pane__header">
			<p class="ui-surface-label">Available models</p>
		</div>
		<div class="ui-pane__body ui-pane__body--scroll">
			<div class="ui-table-wrap">
				<table class="ui-table">
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
						{#each data.models as model (model.id)}
							<tr>
								<td>{model.name}</td>
								<td>{model.inputCost}</td>
								<td>{model.outputCost}</td>
								<td>{model.contextWindow}</td>
								<td>
									<div class="ui-inline">
										{#each model.capabilities as capability (`${model.id}-${capability}`)}
											<span class="ui-chip">{capability}</span>
										{/each}
									</div>
								</td>
								<td>
									<a href={model.openRouterUrl} target="_blank" rel="noreferrer">{model.id}</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</section>
