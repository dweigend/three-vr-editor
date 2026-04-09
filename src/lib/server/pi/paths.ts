/**
 * Purpose: Centralize the app-local filesystem paths used by the Pi integration.
 * Context: Several server modules need the same auth, settings, and session locations.
 * Responsibility: Export stable absolute paths for server-side Pi storage.
 * Boundaries: No file I/O or business logic belongs here.
 */

import { homedir } from 'node:os';
import { join } from 'node:path';

import type { PiSessionScope } from './session-cookie';

export const PI_STORAGE_DIR = join(homedir(), '.three-js-vr-builder', 'pi');
export const PI_AUTH_PATH = join(PI_STORAGE_DIR, 'auth.json');
export const PI_SETTINGS_PATH = join(PI_STORAGE_DIR, 'settings.json');
export const PI_SESSION_ROOT_DIR = join(PI_STORAGE_DIR, 'sessions');
export const PI_CWD = process.cwd();

export function getPiSessionDir(scope: PiSessionScope): string {
	return join(PI_SESSION_ROOT_DIR, scope);
}
