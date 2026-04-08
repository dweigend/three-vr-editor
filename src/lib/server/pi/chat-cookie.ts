/**
 * Purpose: Centralize the cookie contract for persisted Pi chat sessions.
 * Context: The chat page load and JSON endpoints should not duplicate cookie names or options.
 * Responsibility: Expose tiny helpers to read, set, and clear the managed chat session cookie.
 * Boundaries: This module does not create Pi sessions or validate session files.
 */

import type { Cookies } from '@sveltejs/kit';

const PI_CHAT_SESSION_COOKIE = 'pi_demo_chat_session';
const PI_CHAT_COOKIE_OPTIONS = {
	httpOnly: true,
	path: '/',
	sameSite: 'lax' as const
};

export function clearPiChatSessionCookie(cookies: Cookies): void {
	cookies.delete(PI_CHAT_SESSION_COOKIE, { path: '/' });
}

export function getPiChatSessionCookie(cookies: Cookies): string | null {
	return cookies.get(PI_CHAT_SESSION_COOKIE) ?? null;
}

export function setPiChatSessionCookie(cookies: Cookies, sessionFile: string): void {
	cookies.set(PI_CHAT_SESSION_COOKIE, sessionFile, PI_CHAT_COOKIE_OPTIONS);
}
