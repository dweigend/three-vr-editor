/**
 * Purpose: Normalize generated preview source maps so browser errors can be mapped back to editable `static/three` files.
 * Context: The live preview bundles in-memory TypeScript but the editor needs stable original file locations.
 * Responsibility: Rewrite source-map paths into managed relative paths without changing the actual mappings.
 * Boundaries: This file does not build code, render previews, or inspect browser runtime errors.
 */

import { toManagedRelativePath } from './paths';

type PreviewSourceMap = {
	file?: string;
	mappings: string;
	names: string[];
	sourceRoot?: string;
	sources: string[];
	sourcesContent?: Array<string | null>;
	version: number;
};

export function normalizePreviewSourceMap(rootDir: string, sourceMapText: string): string {
	const sourceMap = JSON.parse(sourceMapText) as PreviewSourceMap;

	return JSON.stringify({
		...sourceMap,
		file: 'preview.js',
		sources: sourceMap.sources.map((source) => toManagedRelativePath(rootDir, source))
	});
}
