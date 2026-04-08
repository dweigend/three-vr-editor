/**
 * Purpose: Define the narrow Pi tool that prepares a direct edit for the active editor file.
 * Context: The editor-agent demo should default to applying changes to the active file instead of only returning chat instructions.
 * Responsibility: Validate the active-file target and return structured edit details for client-side apply and auto-save.
 * Boundaries: This tool prepares an edit result but does not mutate arbitrary files or broaden repo write access.
 */

import { Type } from '@mariozechner/pi-ai';
import { defineTool } from '@mariozechner/pi-coding-agent';

import type { ThreeEditorActiveFileContext } from '$lib/three/three-editor-workspace-types';

import { normalizeChangedLineRanges } from './editor-agent-line-ranges';

export const APPLY_ACTIVE_FILE_EDIT_TOOL_NAME = 'apply_active_file_edit';

export type EditorAgentToolDetails = {
	changedLineRanges: {
		endLine: number;
		startLine: number;
	}[];
	path: string;
	summary: string;
	updatedContent: string;
};

export function createApplyActiveFileEditTool(activeFileContext: ThreeEditorActiveFileContext) {
	return defineTool({
		name: APPLY_ACTIVE_FILE_EDIT_TOOL_NAME,
		label: 'Apply Active File Edit',
		description: 'Prepare the final updated content for the currently active editor file.',
		promptGuidelines: [
			'Wenn der Nutzer eine Code-Aenderung fuer die aktive Datei verlangt, benutze dieses Tool statt nur einen Diff oder eine Beschreibung auszugeben.',
			'Rufe dieses Tool erst auf, wenn updatedContent den vollstaendigen finalen Dateitext enthaelt.',
			'changedLineRanges soll die betroffenen Zeilen im neuen Dateistand beschreiben.'
		],
		promptSnippet:
			'apply_active_file_edit(path, updatedContent, changedLineRanges, summary): prepare and apply the final content for the active editor file when the user requested a code change.',
		parameters: Type.Object({
			changedLineRanges: Type.Optional(
				Type.Array(
					Type.Object({
						endLine: Type.Number({ description: 'Last changed line number in the updated file.' }),
						startLine: Type.Number({ description: 'First changed line number in the updated file.' })
					})
				)
			),
			path: Type.String({ description: 'Relative path of the active file to change.' }),
			summary: Type.String({ description: 'One short sentence describing the applied change.' }),
			updatedContent: Type.String({ description: 'The complete final content of the active file.' })
		}),
		execute: async (_toolCallId, params) => {
			const requestedPath = normalizeRequestedPath(params.path);

			if (requestedPath !== activeFileContext.path) {
				throw new Error(`This tool can only update the active file "${activeFileContext.path}".`);
			}

			return {
				content: [
					{
						type: 'text',
						text: `Prepared the updated content for ${activeFileContext.path}.`
					}
				],
				details: {
					changedLineRanges: normalizeChangedLineRanges(
						params.changedLineRanges,
						activeFileContext.content,
						params.updatedContent
					),
					path: activeFileContext.path,
					summary: params.summary.trim(),
					updatedContent: params.updatedContent
				} satisfies EditorAgentToolDetails
			};
		}
	});
}

function normalizeRequestedPath(filePath: string): string {
	return filePath.trim().replace(/^@/, '').replace(/^\.\//, '');
}
