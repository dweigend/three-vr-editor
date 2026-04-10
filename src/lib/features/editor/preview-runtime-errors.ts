import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';

import {
	extractErrorLocation,
	formatErrorSourceLocation,
	toViewerError,
	type ViewerError,
	type ViewerErrorSource
} from './three-viewer-errors';

export type PreviewRuntimeErrorOptions = {
	moduleUrl: string;
	sourceMap: string;
};

export function toPreviewRuntimeError(
	error: unknown,
	options: PreviewRuntimeErrorOptions
): ViewerError {
	const fallbackError = toViewerError(error);
	const parsedLocation = extractErrorLocation(fallbackError.stack ?? undefined);

	if (!parsedLocation || !isPreviewModuleLocation(parsedLocation.source.filePath, options.moduleUrl)) {
		return fallbackError;
	}

	const mappedSource = mapPreviewSourceLocation(options.sourceMap, parsedLocation.source);

	if (!mappedSource) {
		return fallbackError;
	}

	return {
		...fallbackError,
		location: formatErrorSourceLocation(mappedSource),
		source: mappedSource
	};
}

function isPreviewModuleLocation(filePath: string | null, moduleUrl: string): boolean {
	if (!filePath) {
		return false;
	}

	return normalizeModuleUrl(filePath) === normalizeModuleUrl(moduleUrl);
}

function mapPreviewSourceLocation(
	sourceMapText: string,
	source: ViewerErrorSource
): ViewerErrorSource | null {
	if (!source.line) {
		return null;
	}

	const traceMap = new TraceMap(sourceMapText);
	const originalPosition = originalPositionFor(traceMap, {
		column: Math.max((source.column ?? 1) - 1, 0),
		line: source.line
	});

	if (!originalPosition.source || originalPosition.line === null) {
		return null;
	}

	return {
		column: originalPosition.column === null ? null : originalPosition.column + 1,
		filePath: originalPosition.source,
		line: originalPosition.line
	};
}

function normalizeModuleUrl(moduleUrl: string): string {
	return moduleUrl.replace(/^blob:/, '');
}
