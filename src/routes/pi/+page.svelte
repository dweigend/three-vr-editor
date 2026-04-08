<!--
	Purpose: Provide a minimal OpenRouter key management page for the Pi demo.
	Context: Users can validate and store multiple keys, then see and manage the configured list.
	Responsibility: Render one add-key form plus a simple table of stored keys and actions.
	Boundaries: Pi SDK code stays server-side; this page only submits forms and renders results.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import { Button } from '$lib/components';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const keys = $derived(form?.keys ?? data.keys);
	const hasActiveKey = $derived(keys.some((key) => key.isActive) || data.hasActiveKey);
	const feedbackClass = $derived(
		form?.status === 'success' ? 'ui-status ui-status--success' : 'ui-status ui-status--danger'
	);
</script>

<svelte:head>
	<title>OpenRouter Keys</title>
</svelte:head>

<section class="ui-settings-screen">
	<section class="ui-pane">
		<div class="ui-pane__header">
			<p class="ui-surface-label">Keys</p>
			<p class="ui-toolbar-status">{hasActiveKey ? 'Active key ready' : 'No active key'}</p>
		</div>
		<div class="ui-pane__body">
			<form action="?/addKey" class="ui-form-grid" method="POST">
				<div class="ui-form-row">
					<label class="ui-form-label" for="apiKey">OpenRouter API key</label>
					<input
						autocomplete="off"
						class="ui-input"
						id="apiKey"
						name="apiKey"
						spellcheck="false"
						type="password"
					/>
				</div>

				<div class="ui-inline">
					<Button type="submit">Validate and store key</Button>
					<Button href={resolve('/pi/models')} size="sm" variant="ghost">Models</Button>
				</div>
			</form>

			{#if form}
				<p class={feedbackClass}>{form.message}</p>
			{/if}
		</div>
	</section>

	<section class="ui-pane">
		<div class="ui-pane__header">
			<p class="ui-surface-label">Stored keys</p>
		</div>
		<div class="ui-pane__body ui-pane__body--scroll">
			{#if keys.length === 0}
				<p class="ui-empty-state">No keys stored yet.</p>
			{:else}
				<div class="ui-table-wrap">
					<table class="ui-table">
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
										<div class="ui-inline">
											<form method="POST" action="?/activateKey">
												<input type="hidden" name="keyId" value={key.id} />
												<Button type="submit" size="sm" disabled={key.isActive}>Use</Button>
											</form>

											<form method="POST" action="?/deleteKey">
												<input type="hidden" name="keyId" value={key.id} />
												<Button type="submit" size="sm" variant="danger">Delete</Button>
											</form>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</section>
</section>
