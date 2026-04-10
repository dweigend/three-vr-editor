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
