/**
 * Purpose: Centralize the cookie contract for persisted Pi sessions across app surfaces.
 * Context: Chat and editor session mode both persist Pi state, but they must never share cookies.
 * Responsibility: Expose tiny scope-aware helpers to read, set, and clear managed Pi session cookies.
 * Boundaries: This module does not create Pi sessions or validate session files.
 */

import type { Cookies } from '@sveltejs/kit';

export type PiSessionScope = 'chat' | 'editor';

const PI_SESSION_COOKIE_NAMES: Record<PiSessionScope, string> = {
	chat: 'pi_demo_chat_session',
	editor: 'pi_demo_editor_session'
};

const PI_SESSION_COOKIE_OPTIONS = {
	httpOnly: true,
	path: '/',
	sameSite: 'lax' as const
};

export function clearPiSessionCookie(cookies: Cookies, scope: PiSessionScope): void {
	cookies.delete(PI_SESSION_COOKIE_NAMES[scope], { path: '/' });
}

export function getPiSessionCookie(cookies: Cookies, scope: PiSessionScope): string | null {
	return cookies.get(PI_SESSION_COOKIE_NAMES[scope]) ?? null;
}

export function setPiSessionCookie(
	cookies: Cookies,
	scope: PiSessionScope,
	sessionFile: string
): void {
	cookies.set(PI_SESSION_COOKIE_NAMES[scope], sessionFile, PI_SESSION_COOKIE_OPTIONS);
}
