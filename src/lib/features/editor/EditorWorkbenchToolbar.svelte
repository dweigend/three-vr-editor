<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Save from '@lucide/svelte/icons/save';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import Monitor from '@lucide/svelte/icons/monitor';
	import CodeXml from '@lucide/svelte/icons/code-xml';
	import Workflow from '@lucide/svelte/icons/workflow';
	import Bot from '@lucide/svelte/icons/bot';
	import Redo2 from '@lucide/svelte/icons/redo-2';
	import X from '@lucide/svelte/icons/x';

	import {
		DropdownMenu,
		Separator,
		ToolbarButton,
		ToolbarGroup,
		ToolbarGroupItem,
		ToolbarRoot
	} from '$lib/components';
	import type { ThreeSourceFileSummary } from '$lib/features/editor/three-editor-types';
	import type {
		ThreeCreateFileRequest,
		ThreeTemplateSummary
	} from '$lib/features/editor/three-template-types';
	import {
		editorWorkbenchPanels,
		type EditorWorkbenchPanelKey
	} from '$lib/features/editor/editor-workbench';

	import FileSelect from './FileSelect.svelte';

	type Props = {
		canRedo?: boolean;
		files?: ThreeSourceFileSummary[];
		onCreateFile?: ((request: ThreeCreateFileRequest) => Promise<void>) | undefined;
		onRedo?: (() => void) | undefined;
		onSave?: (() => void | Promise<void>) | undefined;
		saveDisabled?: boolean;
		selectedPath?: string;
		statusClassName?: string;
		statusText?: string;
		templates?: ThreeTemplateSummary[];
		windowVisibility?: EditorWorkbenchPanelKey[];
	};

	const windowIcons = {
		agent: Bot,
		code: CodeXml,
		controls: SlidersHorizontal,
		'node-editor': Workflow,
		preview: Monitor
	} satisfies Record<EditorWorkbenchPanelKey, typeof Monitor>;

	let {
		canRedo = false,
		files = [],
		onCreateFile,
		onRedo,
		onSave,
		saveDisabled = false,
		selectedPath = $bindable(''),
		statusClassName = 'ui-toolbar-status',
		statusText = '',
		templates = [],
		windowVisibility = $bindable<EditorWorkbenchPanelKey[]>([])
	}: Props = $props();

	let isCreateMenuOpen = $state(false);
	let isCreatingFile = $state(false);

	const createMenuItems = $derived([
		{
			description: 'Create a blank editable scene under static/three/scenes',
			request: {
				fileName: 'new-scene',
				mode: 'blank'
			} satisfies ThreeCreateFileRequest,
			textValue: 'Blank starter',
			title: 'Blank starter'
		},
		...templates.map((template) => ({
			description: template.description,
			request: {
				fileName: template.title,
				mode: 'template',
				templatePath: template.path
			} satisfies ThreeCreateFileRequest,
			textValue: template.title,
			title: template.title
		}))
	]);

	async function handleCreateFile(request: ThreeCreateFileRequest): Promise<void> {
		if (!onCreateFile || isCreatingFile) {
			return;
		}

		isCreatingFile = true;
		isCreateMenuOpen = false;

		try {
			await onCreateFile(request);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : 'Create file failed.');
		} finally {
			isCreatingFile = false;
		}
	}
</script>

<ToolbarRoot aria-label="Editor workbench toolbar" class="ui-workbench-toolbar">
	<div class="ui-workbench-toolbar__groups">
		<div class="ui-toolbar__group ui-toolbar__group--editor" role="group" aria-label="File actions">
			{#if files.length > 0}
				<FileSelect files={files} bind:value={selectedPath} compact label="Editor file" />
			{/if}

			{#if onCreateFile}
				<DropdownMenu.Root bind:open={isCreateMenuOpen}>
					<DropdownMenu.Trigger
						aria-label="Create new file"
						class="ui-button ui-button--ghost ui-button--sm ui-toolbar-button ui-toolbar-button--icon"
						disabled={isCreatingFile}
						title="Create new file"
					>
						<Plus aria-hidden="true" size={16} />
					</DropdownMenu.Trigger>

					<DropdownMenu.Portal>
						<DropdownMenu.Content class="ui-code-editor__create-menu" sideOffset={8}>
							{#each createMenuItems as item (item.textValue)}
								<DropdownMenu.Item
									class="ui-code-editor__create-menu-item"
									onSelect={() => {
										void handleCreateFile(item.request);
									}}
									textValue={item.textValue}
								>
									<div class="ui-code-editor__create-menu-copy">
										<span class="ui-code-editor__create-menu-title">{item.title}</span>
										<span class="ui-code-editor__create-menu-meta">{item.description}</span>
									</div>
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			{/if}

			<ToolbarButton
				aria-label="Delete current file"
				class="ui-button--ghost ui-toolbar-button--icon"
				disabled={true}
				title="Delete current file (coming soon)"
				type="button"
			>
				<X aria-hidden="true" size={16} />
			</ToolbarButton>
		</div>

		<Separator aria-hidden="true" class="ui-workbench-toolbar__separator" decorative orientation="vertical" />

		<div
			class="ui-toolbar__group ui-toolbar__group--editor"
			role="group"
			aria-label="Document actions"
		>
			<ToolbarButton
				aria-label="Save active file"
				class="ui-toolbar-button--icon"
				disabled={saveDisabled}
				title="Save active file"
				type="button"
				onclick={() => {
					void onSave?.();
				}}
			>
				<Save aria-hidden="true" size={16} />
			</ToolbarButton>

			<ToolbarButton
				aria-label="Redo last change"
				class="ui-button--ghost ui-toolbar-button--icon"
				disabled={!canRedo || !onRedo}
				title="Redo last change"
				type="button"
				onclick={() => {
					onRedo?.();
				}}
			>
				<Redo2 aria-hidden="true" size={16} />
			</ToolbarButton>
		</div>

		<Separator aria-hidden="true" class="ui-workbench-toolbar__separator" decorative orientation="vertical" />

		<ToolbarGroup
			aria-label="Workbench windows"
			bind:value={windowVisibility}
			class="ui-workbench-toolbar__toggle-group"
			type="multiple"
		>
			{#each editorWorkbenchPanels as panel (panel.key)}
				{@const Icon = windowIcons[panel.key]}
				<ToolbarGroupItem
					aria-controls={panel.panelId}
					aria-label={`Toggle ${panel.label} panel`}
					class="ui-toolbar-button--icon"
					title={panel.label}
					value={panel.key}
				>
					<Icon aria-hidden="true" size={16} />
				</ToolbarGroupItem>
			{/each}
		</ToolbarGroup>
	</div>

	{#if statusText}
		<p class={statusClassName} title={statusText}>{statusText}</p>
	{/if}
</ToolbarRoot>
