<!-- Consolidated Pi settings screen. -->

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Cpu from '@lucide/svelte/icons/cpu';
	import Database from '@lucide/svelte/icons/database';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import './settings.css';

	import {
		IconButton,
		ScrollArea,
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
		TextInput
	} from '$lib/components';
	import { SettingsSection } from '$lib/blocks';

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

<section class="settings-page ui-screen ui-screen--stack">
	<div class="ui-grid ui-grid--two ui-grid--compact">
		<SettingsSection meta={hasActiveKey ? 'Active key ready' : 'No active key'} title="Keys">
			{#snippet icon()}
				<KeyRound aria-hidden="true" size={16} />
			{/snippet}

			<form action="?/addKey" class="settings-inline-form ui-form-inline" method="POST">
				<label class="sr-only" for="apiKey">OpenRouter API key</label>
				<div class="settings-inline-form__field">
					<span class="settings-inline-form__icon">
						<KeyRound aria-hidden="true" size={16} />
					</span>
					<TextInput
						aria-label="OpenRouter API key"
						autocomplete="off"
						class="settings-inline-form__input ui-input"
						id="apiKey"
						name="apiKey"
						placeholder="Paste OpenRouter API key"
						spellcheck={false}
						type="password"
					/>
				</div>
				<IconButton
					ariaLabel="Store key"
					class="ui-icon-action"
					title="Store key"
					type="submit"
					variant="primary"
				>
					{#snippet children()}
						<Save aria-hidden="true" size={16} />
					{/snippet}
				</IconButton>
			</form>
		</SettingsSection>

		<SettingsSection meta={`${keys.length} total`} title="Stored keys">
			{#snippet icon()}
				<Database aria-hidden="true" size={16} />
			{/snippet}

			{#if keys.length === 0}
				<p class="ui-empty-state">No stored keys.</p>
			{:else}
				<ScrollArea
					class="settings-scroll-shell settings-scroll-shell--keys"
					viewportClass="settings-scroll-shell__viewport"
				>
					<Table
						ariaLabel="Stored OpenRouter keys"
						class="settings-table-shell settings-table-shell--compact"
					>
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
										<span class="ui-pill" class:ui-pill--active={key.isActive}>
											{key.isActive ? 'Active' : 'Stored'}
										</span>
									</TableCell>
									<TableCell>
										<div class="settings-table__actions">
											<form action="?/activateKey" method="POST">
												<input name="keyId" type="hidden" value={key.id} />
												<IconButton
													ariaLabel={key.isActive ? 'Key already active' : 'Use key'}
													class="ui-icon-action"
													disabled={key.isActive}
													title={key.isActive ? 'Key already active' : 'Use key'}
													type="submit"
												>
													{#snippet children()}
														<Check aria-hidden="true" size={16} />
													{/snippet}
												</IconButton>
											</form>

											<form action="?/deleteKey" method="POST">
												<input name="keyId" type="hidden" value={key.id} />
												<IconButton
													ariaLabel="Delete key"
													class="ui-icon-action"
													title="Delete key"
													type="submit"
													variant="danger"
												>
													{#snippet children()}
														<Trash2 aria-hidden="true" size={16} />
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
		</SettingsSection>
	</div>

	{#if formMessage}
		<p class={feedbackClass}>{formMessage}</p>
	{/if}

	<form action="?/saveModel" class="settings-model-form" method="POST">
		<input name="modelId" type="hidden" value={draftSelectedModelId} />
		<SettingsSection class="settings-section--fill" meta={draftSelectedModel.name} title="Models">
			{#snippet icon()}
				<Cpu aria-hidden="true" size={16} />
			{/snippet}

			{#snippet headerActions()}
				<IconButton
					ariaLabel="Save model"
					class="ui-icon-action"
					title="Save model"
					type="submit"
					variant="primary"
				>
					{#snippet children()}
						<Save aria-hidden="true" size={16} />
					{/snippet}
				</IconButton>
			{/snippet}

			<ScrollArea
				class="settings-scroll-shell settings-scroll-shell--models"
				viewportClass="settings-scroll-shell__viewport"
			>
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
											<span class="ui-pill">{capability}</span>
										{/each}
									</div>
								</TableCell>
								<TableCell>
									<span
										aria-label={model.id === draftSelectedModelId
											? `${model.name} selected`
											: `Select ${model.name}`}
										class="ui-selection-indicator"
										class:ui-selection-indicator--selected={model.id === draftSelectedModelId}
									>
										{#if model.id === draftSelectedModelId}
											<Check aria-hidden="true" size={16} />
										{/if}
									</span>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</ScrollArea>
		</SettingsSection>
	</form>
</section>
