<script lang="ts">
	type Props = {
		activeFileName?: string | null;
		panelId: string;
	};

	let { activeFileName = null, panelId }: Props = $props();
</script>

<section class="ui-pane ui-pane--muted" id={panelId}>
	<div class="ui-pane__header">
		<div class="ui-stack ui-stack--tight">
			<p class="ui-surface-label">Controls</p>
			<p class="ui-toolbar-status">Workbench shell</p>
		</div>
	</div>

	<div class="ui-pane__body ui-pane__body--scroll">
		<div class="ui-workbench-placeholder">
			<p class="ui-empty-state">Control presets land here next.</p>
			<p class="ui-text-muted">
				{activeFileName
					? `Ready to attach parameter controls to ${activeFileName}.`
					: 'Open a file to prepare preview controls.'}
			</p>
		</div>
	</div>
</section>
