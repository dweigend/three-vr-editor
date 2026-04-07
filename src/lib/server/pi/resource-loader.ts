/**
 * Purpose: Build the Pi resource loader for the demo chat runtime.
 * Context: The demo needs one central place for system-prompt customization.
 * Responsibility: Append the shared demo prompt and reload resources before session startup.
 * Boundaries: This module does not create sessions or map chat transcripts.
 */

import { DefaultResourceLoader } from '@mariozechner/pi-coding-agent';

import { PI_DEMO_CWD } from './paths';

const PI_DEMO_SYSTEM_PROMPT = 'Sprich den Nutzer auf Deutsch und konsequent per Du an.';

export async function createPiDemoResourceLoader(): Promise<DefaultResourceLoader> {
	const resourceLoader = new DefaultResourceLoader({
		cwd: PI_DEMO_CWD,
		appendSystemPromptOverride: (base) => [...base, PI_DEMO_SYSTEM_PROMPT]
	});

	await resourceLoader.reload();

	return resourceLoader;
}
