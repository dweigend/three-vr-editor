/**
 * Purpose: Redirect the root path to the main editor workspace.
 * Context: The app intentionally exposes only three user-facing pages: editor, chat, and settings.
 * Responsibility: Keep `/` as a stable entrypoint without introducing a fourth launcher page.
 * Boundaries: This file does not load editor data or render UI.
 */

import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	throw redirect(307, '/editor');
};
