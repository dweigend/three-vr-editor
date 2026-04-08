/**
 * Purpose: Verify that the Pi editor-agent prompt and result helpers keep the edit workflow predictable.
 * Context: The editor-agent endpoint relies on these helpers to steer Pi toward direct active-file edits and map structured tool output.
 * Responsibility: Cover the active file metadata, tool-first prompt hints, follow-up context, and tool-result mapping.
 * Boundaries: These tests do not create real Pi sessions or call external providers.
 */

import { describe, expect, it } from 'vitest';

import { buildPiEditorAgentPrompt, toPiEditorAgentAppliedEdit } from './editor-agent';

describe('buildPiEditorAgentPrompt', () => {
	it('includes the active file path, editor snapshot, and dirty-state hint', () => {
		const prompt = buildPiEditorAgentPrompt({
			file: {
				content: 'export const createDemoScene = () => ({ update() {}, dispose() {} });',
				isDirty: true,
				path: 'cube.ts',
				savedContent: 'export const createDemoScene = () => null;'
			},
			prompt: 'Was macht diese Datei?'
		});

		expect(prompt).toContain('Aktive Datei: cube.ts');
		expect(prompt).toContain('Dateistatus: unsaved editor changes present');
		expect(prompt).toContain('```ts');
		expect(prompt).toContain('export const createDemoScene');
		expect(prompt).toContain('Nutzerfrage:\nWas macht diese Datei?');
		expect(prompt).toContain('aktive Datei direkt ueber das bereitgestellte Tool aktualisieren');
	});

	it('includes only the provided previous turn for follow-up context', () => {
		const prompt = buildPiEditorAgentPrompt({
			file: {
				content: 'export const createDemoScene = () => ({ update() {}, dispose() {} });',
				isDirty: false,
				path: 'cube.ts',
				savedContent: 'export const createDemoScene = () => ({ update() {}, dispose() {} });'
			},
			previousTurn: {
				answer: 'Sie rendert einen kleinen Demo-Controller.',
				prompt: 'Was exportiert die Datei?'
			},
			prompt: 'Und wie koennte ich sie erweitern?'
		});

		expect(prompt).toContain('Vorherige Runde fuer das aktuelle Follow-up:');
		expect(prompt).toContain('Vorherige Nutzerfrage: Was exportiert die Datei?');
		expect(prompt).toContain('Sie rendert einen kleinen Demo-Controller.');
		expect(prompt).toContain('Und wie koennte ich sie erweitern?');
	});
});

describe('toPiEditorAgentAppliedEdit', () => {
	it('maps valid tool details into an applied edit payload', () => {
		expect(
			toPiEditorAgentAppliedEdit({
				changedLineRanges: [
					{
						endLine: 4,
						startLine: 2
					}
				],
				path: 'cube.ts',
				summary: 'Die Farbe wurde auf Rot umgestellt.',
				updatedContent: 'const CUBE_COLOR = "#ff0000";'
			})
		).toEqual({
			changedLineRanges: [
				{
					endLine: 4,
					startLine: 2
				}
			],
			content: 'const CUBE_COLOR = "#ff0000";',
			path: 'cube.ts',
			summary: 'Die Farbe wurde auf Rot umgestellt.'
		});
	});

	it('returns undefined for invalid tool details', () => {
		expect(toPiEditorAgentAppliedEdit({ path: 'cube.ts' })).toBeUndefined();
	});
});
