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
			<p class="ui-surface-label">Node Editor</p>
			<p class="ui-toolbar-status">Workbench shell</p>
		</div>
	</div>

	<div class="ui-pane__body ui-pane__body--scroll">
		<div class="ui-workbench-placeholder">
			<p class="ui-empty-state">Node graph tools arrive in the next milestone.</p>
			<p class="ui-text-muted">
				{activeFileName
					? `Prepared for ${activeFileName} with graceful empty-state handling.`
					: 'Open a file to seed future node mappings.'}
			</p>
		</div>
	</div>
</section>
