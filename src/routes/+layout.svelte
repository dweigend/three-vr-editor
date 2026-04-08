<!--
	Purpose: Provide the shared square application chrome for every route.
	Context: The app now follows a single framed shell with a left home cell and a right navigation panel toggle.
	Responsibility: Render the persistent top bar, manage the simple side menu state, and host route content.
	Boundaries: Route-specific screen composition stays in the individual pages and shared workbench modules.
-->

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Menu from '@lucide/svelte/icons/menu';
	import MessageSquareText from '@lucide/svelte/icons/message-square-text';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import SquarePen from '@lucide/svelte/icons/square-pen';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { IconButton } from '$lib/components';

	let { children } = $props();
	let isMenuOpen = $state(false);

	afterNavigate(() => {
		isMenuOpen = false;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="ui-app-shell">
	<div class="ui-frame">
		<header class="ui-topbar">
			<a aria-label="Open demos" class="ui-topbar__home" href={resolve('/')}>
				<span aria-hidden="true" class="ui-topbar__home-mark"></span>
			</a>

			<div aria-hidden="true" class="ui-topbar__rule"></div>

			<div class="ui-topbar__settings">
				<IconButton
					ariaControls="app-shell-menu"
					ariaExpanded={isMenuOpen}
					ariaHaspopup={true}
					ariaLabel="Toggle workspace menu"
					onclick={() => {
						isMenuOpen = !isMenuOpen;
					}}
				>
					<Menu size={18} />
				</IconButton>
			</div>
		</header>

		<main class="ui-page">
			<div class:ui-page-shell--menu-open={isMenuOpen} class="ui-page-shell">
				<div class="ui-page-shell__content">
					<div class="ui-page__canvas">
						{@render children()}
					</div>
				</div>

				{#if isMenuOpen}
					<aside aria-label="Workspace menu" class="ui-page-shell__menu" id="app-shell-menu">
						<nav class="ui-nav-panel">
							<a
								aria-current={page.url.pathname.startsWith('/pi') ? 'page' : undefined}
								class="ui-nav-panel__link"
								class:ui-nav-panel__link--active={page.url.pathname.startsWith('/pi')}
								href={resolve('/pi')}
							>
								<Settings2 size={18} />
								<span>Settings</span>
							</a>

							<a
								aria-current={page.url.pathname.startsWith('/three/editor') ? 'page' : undefined}
								class="ui-nav-panel__link"
								class:ui-nav-panel__link--active={page.url.pathname.startsWith('/three/editor')}
								href={resolve('/three/editor/pi')}
							>
								<SquarePen size={18} />
								<span>Editor</span>
							</a>

							<a
								aria-current={page.url.pathname.startsWith('/pi/chat') ? 'page' : undefined}
								class="ui-nav-panel__link"
								class:ui-nav-panel__link--active={page.url.pathname.startsWith('/pi/chat')}
								href={resolve('/pi/chat')}
							>
								<MessageSquareText size={18} />
								<span>Chat</span>
							</a>
						</nav>
					</aside>
				{/if}
			</div>
		</main>
	</div>
</div>
