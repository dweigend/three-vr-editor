<!--
	Purpose: Provide the consolidated Pi settings page for the app.
	Context: Users should configure keys and the active model in one place instead of navigating through multiple settings routes.
	Responsibility: Render key management, model selection, and the stored-key list.
	Boundaries: Pi SDK code stays server-side; this page only submits forms and renders results.
-->

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Cpu from '@lucide/svelte/icons/cpu';
	import Database from '@lucide/svelte/icons/database';
	import {
		IconButton,
		ScrollArea,
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const keys = $derived(form?.keys ?? data.keys);
	const hasActiveKey = $derived(keys.some((key) => key.isActive) || data.hasActiveKey);
	const selectedModelId = $derived(form?.selectedModelId ?? data.selectedModelId);
	const formMessage = $derived(form?.message ?? null);
	const feedbackClass = $derived(
		form?.status === 'success' ? 'ui-status ui-status--success' : 'ui-status ui-status--danger'
	);

	let draftSelectedModelId = $state('');

	$effect(() => {
		draftSelectedModelId = selectedModelId;
	});

	const draftSelectedModel = $derived(
		data.models.find((model) => model.id === draftSelectedModelId) ?? data.models[0]
	);
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<section class="settings-page">
	<div class="settings-page__top-grid">
		<section class="settings-panel settings-panel--compact">
			<header class="settings-panel__header">
				<div class="settings-panel__heading">
					<KeyRound aria-hidden="true" size={16} />
					<p class="settings-panel__title">Keys</p>
				</div>
				<p class="settings-panel__meta">{hasActiveKey ? 'Active key ready' : 'No active key'}</p>
			</header>

			<form action="?/addKey" class="settings-inline-form" method="POST">
				<label class="sr-only" for="apiKey">OpenRouter API key</label>
				<div class="settings-inline-form__field">
					<span class="settings-inline-form__icon">
						<KeyRound aria-hidden="true" size={16} />
					</span>
					<input
						aria-label="OpenRouter API key"
						autocomplete="off"
						class="ui-input settings-inline-form__input"
						id="apiKey"
						name="apiKey"
						placeholder="Paste OpenRouter API key"
						spellcheck="false"
						type="password"
					/>
				</div>
				<IconButton
					ariaLabel="Store key"
					class="settings-panel__action-button"
					title="Store key"
					type="submit"
					variant="primary"
				>
					{#snippet children()}
						<Save aria-hidden="true" size={18} />
					{/snippet}
				</IconButton>
			</form>
		</section>

		<section class="settings-panel settings-panel--compact">
			<header class="settings-panel__header">
				<div class="settings-panel__heading">
					<Database aria-hidden="true" size={16} />
					<p class="settings-panel__title">Stored keys</p>
				</div>
				<p class="settings-panel__meta">{keys.length} total</p>
			</header>

			{#if keys.length === 0}
				<p class="ui-empty-state">No keys stored yet.</p>
			{:else}
				<ScrollArea class="settings-scroll-shell settings-scroll-shell--keys" viewportClass="settings-scroll-shell__viewport">
					<Table ariaLabel="Stored OpenRouter keys" class="settings-table-shell settings-table-shell--compact">
						<TableHeader>
							<TableRow>
								<TableHead scope="col">Key</TableHead>
								<TableHead scope="col">Status</TableHead>
								<TableHead scope="col">Actions</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{#each keys as key}
								<TableRow selected={key.isActive}>
									<TableCell>
										<p class="settings-table__title">{key.maskedKey}</p>
									</TableCell>
									<TableCell>
										<span class:settings-table__status--active={key.isActive} class="settings-table__status">
											{key.isActive ? 'Active' : 'Stored'}
										</span>
									</TableCell>
									<TableCell>
										<div class="settings-table__actions">
											<form method="POST" action="?/activateKey">
												<input type="hidden" name="keyId" value={key.id} />
												<IconButton
													ariaLabel={key.isActive ? 'Key already active' : 'Use key'}
													class="settings-table__icon-action"
													disabled={key.isActive}
													title={key.isActive ? 'Key already active' : 'Use key'}
													type="submit"
												>
													{#snippet children()}
														<Check aria-hidden="true" size={18} />
													{/snippet}
												</IconButton>
											</form>

											<form method="POST" action="?/deleteKey">
												<input type="hidden" name="keyId" value={key.id} />
												<IconButton
													ariaLabel="Delete key"
													class="settings-table__icon-action"
													title="Delete key"
													type="submit"
													variant="danger"
												>
													{#snippet children()}
														<Trash2 aria-hidden="true" size={18} />
													{/snippet}
												</IconButton>
											</form>
										</div>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</ScrollArea>
			{/if}
		</section>
	</div>

	{#if formMessage}
		<p class={feedbackClass}>{formMessage}</p>
	{/if}

	<section class="settings-panel settings-panel--models">
		<form action="?/saveModel" class="settings-model-form" method="POST">
			<header class="settings-panel__header settings-panel__header--models">
				<div class="settings-panel__header-copy">
					<div class="settings-panel__heading">
						<Cpu aria-hidden="true" size={16} />
						<p class="settings-panel__title">Models</p>
					</div>
					<p class="settings-panel__meta">{draftSelectedModel.name}</p>
				</div>

				<div class="settings-panel__header-actions">
					<input name="modelId" type="hidden" value={draftSelectedModelId} />
					<IconButton
						ariaLabel="Save model"
						class="settings-panel__action-button"
						title="Save model"
						type="submit"
						variant="primary"
					>
						{#snippet children()}
							<Save aria-hidden="true" size={18} />
						{/snippet}
					</IconButton>
				</div>
			</header>

			<ScrollArea class="settings-scroll-shell settings-scroll-shell--models" viewportClass="settings-scroll-shell__viewport">
				<Table ariaLabel="OpenRouter models" class="settings-table-shell" tableClass="settings-model-table">
					<TableHeader>
						<TableRow>
							<TableHead scope="col">Model</TableHead>
							<TableHead scope="col">Input</TableHead>
							<TableHead scope="col">Output</TableHead>
							<TableHead scope="col">Context</TableHead>
							<TableHead scope="col">Capabilities</TableHead>
							<TableHead scope="col">OpenRouter</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{#each data.models as model (model.id)}
							<TableRow
								selected={model.id === draftSelectedModelId}
								onclick={() => {
									draftSelectedModelId = model.id;
								}}
								onkeydown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										draftSelectedModelId = model.id;
									}
								}}
								tabindex={0}
							>
								<TableCell>
									<div class="settings-table__identity">
										<p class="settings-table__title">{model.name}</p>
										<p class="settings-table__secondary">{model.id}</p>
									</div>
								</TableCell>
								<TableCell>{model.inputCost}</TableCell>
								<TableCell>{model.outputCost}</TableCell>
								<TableCell>{model.contextWindow}</TableCell>
								<TableCell>
									<div class="settings-capability-list">
										{#each model.capabilities as capability (capability)}
											<span class="settings-capability-chip">{capability}</span>
										{/each}
									</div>
								</TableCell>
								<TableCell>
									<span
										aria-label={model.id === draftSelectedModelId ? `${model.name} selected` : `Select ${model.name}`}
										class:settings-table__picker--selected={model.id === draftSelectedModelId}
										class="settings-table__picker"
									>
										{#if model.id === draftSelectedModelId}
											<Check aria-hidden="true" size={16} strokeWidth={2.4} />
										{/if}
									</span>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</ScrollArea>
		</form>
	</section>
</section>

<style>
	.settings-page {
		display: grid;
		gap: var(--ui-space-3);
		padding: var(--ui-space-3);
		min-height: 100%;
		align-content: start;
	}

	.settings-page__top-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--ui-space-3);
		align-items: stretch;
	}

	.settings-panel {
		display: grid;
		gap: 0.8rem;
		border: 1px solid var(--ui-color-border);
		background: var(--ui-color-surface);
		padding: 0.75rem 0.85rem 0.85rem;
		min-width: 0;
	}

	.settings-panel--compact {
		grid-template-rows: auto 1fr;
	}

	.settings-panel__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		flex-wrap: wrap;
		min-height: 1.4rem;
	}

	.settings-panel__heading {
		display: inline-flex;
		align-items: center;
		gap: 0.42rem;
		min-width: 0;
	}

	.settings-panel__heading :global(svg) {
		color: var(--ui-color-accent-strong);
		flex-shrink: 0;
	}

	.settings-panel__header--models {
		padding-bottom: 0.05rem;
	}

	.settings-panel__header-copy,
	.settings-panel__header-actions {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		flex-wrap: wrap;
	}

	.settings-panel__header-copy {
		min-width: 0;
		flex: 1;
		justify-content: space-between;
	}

	.settings-panel__title,
	.settings-panel__meta,
	.settings-table__title,
	.settings-table__secondary {
		margin: 0;
	}

	.settings-panel__title {
		color: var(--ui-color-accent-strong);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.settings-panel__meta {
		color: var(--ui-color-text-muted);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		white-space: nowrap;
		text-align: right;
	}

	.settings-inline-form {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.65rem;
	}

	.settings-inline-form__field {
		position: relative;
		min-width: 0;
	}

	.settings-inline-form__icon {
		position: absolute;
		left: 0.78rem;
		top: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--ui-color-text-muted);
		transform: translateY(-50%);
		pointer-events: none;
	}

	.settings-inline-form__input {
		padding-left: 2.2rem;
	}

	.settings-model-form {
		display: grid;
		gap: var(--ui-space-3);
		min-height: 0;
	}

	.settings-table__title {
		font-size: 0.88rem;
		font-weight: 700;
	}

	.settings-table__identity {
		display: grid;
		gap: 0.15rem;
	}

	.settings-table__secondary--wrap {
		white-space: normal;
	}

	.settings-scroll-shell {
		min-width: 0;
	}

	.settings-scroll-shell--keys {
		height: 5.1rem;
	}

	.settings-scroll-shell--models {
		height: min(25rem, calc(100vh - 15.5rem));
	}

	.settings-scroll-shell__viewport {
		height: 100%;
	}

	.settings-table-shell:global(.ui-data-table-shell) {
		border: 0;
		background: transparent;
	}

	:global(.settings-table-shell--compact .ui-data-table__head),
	:global(.settings-table-shell--compact .ui-data-table__cell) {
		padding-top: 0.42rem;
		padding-bottom: 0.42rem;
	}

	:global(.settings-table-shell .ui-data-table__head),
	:global(.settings-table-shell .ui-data-table__cell) {
		padding-left: 0.72rem;
		padding-right: 0.72rem;
	}

	.settings-model-table:global(.ui-data-table) {
		min-width: 60rem;
	}

	:global(.settings-model-table .ui-data-table__row) {
		cursor: pointer;
		transition:
			background var(--ui-transition-fast),
			box-shadow var(--ui-transition-fast);
	}

	:global(.settings-model-table .ui-data-table__row:hover),
	:global(.settings-model-table .ui-data-table__row:focus-visible) {
		background: rgba(255, 255, 255, 0.03);
		outline: none;
	}

	:global(.settings-model-table .ui-data-table__row[data-selected='true']) {
		box-shadow: inset 2px 0 0 var(--ui-color-accent);
	}

	:global(.settings-model-table .ui-data-table__head:nth-child(2)),
	:global(.settings-model-table .ui-data-table__head:nth-child(3)),
	:global(.settings-model-table .ui-data-table__head:nth-child(4)),
	:global(.settings-model-table .ui-data-table__head:nth-child(6)),
	:global(.settings-model-table .ui-data-table__cell:nth-child(2)),
	:global(.settings-model-table .ui-data-table__cell:nth-child(3)),
	:global(.settings-model-table .ui-data-table__cell:nth-child(4)),
	:global(.settings-model-table .ui-data-table__cell:nth-child(6)) {
		white-space: nowrap;
	}

	.settings-capability-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.32rem;
	}

	.settings-capability-chip {
		display: inline-flex;
		align-items: center;
		border: 1px solid rgba(255, 255, 255, 0.12);
		padding: 0.18rem 0.36rem;
		color: var(--ui-color-text-muted);
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.settings-table__status {
		display: inline-flex;
		align-items: center;
		border: 1px solid rgba(255, 255, 255, 0.12);
		padding: 0.18rem 0.36rem;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ui-color-text-muted);
	}

	.settings-table__status--active {
		background: rgba(168, 85, 247, 0.16);
		color: var(--ui-color-text);
		border-color: rgba(168, 85, 247, 0.32);
	}

	.settings-table__picker {
		display: inline-grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.04);
		color: transparent;
	}

	.settings-table__picker--selected {
		border-color: rgba(168, 85, 247, 0.8);
		background: rgba(168, 85, 247, 0.95);
		color: #060608;
	}

	.settings-table__actions {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 0.35rem;
	}

	.settings-panel__action-button,
	.settings-table__icon-action {
		width: 2.05rem;
		min-width: 2.05rem;
		height: 2.05rem;
		min-height: 2.05rem;
		padding: 0;
	}

	.settings-panel__action-button :global(svg),
	.settings-table__icon-action :global(svg) {
		display: block;
	}

	@media (max-width: 960px) {
		.settings-page__top-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 720px) {
		.settings-page {
			padding: 0.9rem;
		}

		.settings-inline-form {
			grid-template-columns: 1fr;
		}

		.settings-panel {
			padding: 0.9rem;
		}

		.settings-scroll-shell--models {
			height: min(24rem, calc(100vh - 16rem));
		}
	}
</style>
