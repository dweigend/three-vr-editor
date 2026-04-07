/**
 * Purpose: Centralize the app-local filesystem paths used by the Pi demo.
 * Context: Several server modules need the same auth, settings, and session locations.
 * Responsibility: Export stable absolute paths for server-side Pi storage.
 * Boundaries: No file I/O or business logic belongs here.
 */

import { homedir } from 'node:os';
import { join } from 'node:path';

export const PI_DEMO_APP_DIR = join(homedir(), '.three-js-vr-builder', 'pi');
export const PI_DEMO_AUTH_PATH = join(PI_DEMO_APP_DIR, 'auth.json');
export const PI_DEMO_SETTINGS_PATH = join(PI_DEMO_APP_DIR, 'settings.json');
export const PI_DEMO_SESSION_DIR = join(PI_DEMO_APP_DIR, 'sessions');
export const PI_DEMO_CWD = process.cwd();
