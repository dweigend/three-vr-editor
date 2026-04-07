<!--
	Purpose: Provide a minimal entry page with links to the important project routes.
	Context: This replaces the default scaffolded SvelteKit welcome page.
	Responsibility: Offer quick navigation only, without styling or extra behavior.
	Boundaries: No business logic or server interaction belongs here.
-->

<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>Start</h1>

<p><a href={resolve('/demo/pi')}>Pi key setup</a></p>
<p><a href={resolve('/demo/pi/chat')}>Pi chat demo</a></p>
<p><a href={resolve('/demo/pi/models')}>Pi model settings</a></p>
