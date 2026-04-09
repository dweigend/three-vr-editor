/**
 * Purpose: Build the shared Pi resource loader for chat and editor sessions.
 * Context: Both surfaces need one central place for system-prompt customization before a session starts.
 * Responsibility: Append the shared system prompt override and reload resources before session startup.
 * Boundaries: This module does not create sessions or map chat transcripts.
 */

import { DefaultResourceLoader } from '@mariozechner/pi-coding-agent';

import { PI_CWD } from './paths';

const PI_SYSTEM_PROMPT = 'Sprich den Nutzer auf Deutsch und konsequent per Du an.';

export async function createPiResourceLoader(options?: {
	appendSystemPrompts?: string[];
}): Promise<DefaultResourceLoader> {
	const appendSystemPrompts = options?.appendSystemPrompts ?? [];
	const resourceLoader = new DefaultResourceLoader({
		cwd: PI_CWD,
		appendSystemPromptOverride: (base) => [...base, PI_SYSTEM_PROMPT, ...appendSystemPrompts]
	});

	await resourceLoader.reload();

	return resourceLoader;
}
