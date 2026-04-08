<!--
	Purpose: Render the first isolated Three.js smoke-test route for the repository.
	Context: This route validates the viewer setup before any workbench or editor-preview coupling is added.
	Responsibility: Present the rotating-cube demo, document the static asset path, and link back to the existing demos.
	Boundaries: This page does not execute user-authored code or load real 3D assets yet.
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import ThreeViewer from '$lib/three/ThreeViewer.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<section class="ui-screen ui-screen--workbench">
	<div class="ui-toolbar">
		<div class="ui-toolbar__group">
			<p class="ui-surface-label">{data.title}</p>
		</div>
		<div class="ui-toolbar__spacer"></div>
		<div class="ui-inline">
			<a class="ui-button ui-button--ghost ui-button--sm" href={resolve('/three/editor')}>
				Editor
			</a>
			<a class="ui-button ui-button--ghost ui-button--sm" href={resolve('/three/editor/pi')}>
				Editor + Pi
			</a>
			<a
				class="ui-button ui-button--ghost ui-button--sm"
				href={resolve('/three/editor/templates')}
			>
				Templates
			</a>
		</div>
	</div>

	<section class="ui-pane ui-pane--plain ui-pane--muted">
		<ThreeViewer assetBaseUrl={data.assetBaseUrl} />
	</section>
</section>
