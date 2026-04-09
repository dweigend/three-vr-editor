/**
 * Purpose: Normalize and format runtime errors from the local Three.js preview.
 * Context: Viewer setup and animation failures should stay inside the preview panel instead of breaking the page.
 * Responsibility: Convert unknown thrown values into a stable UI model and extract a best-effort source location.
 * Boundaries: This module does not log errors, talk to Svelte, or know anything about renderer lifecycle.
 */

export type ViewerError = {
	title: string;
	message: string;
	location: string | null;
	source: ViewerErrorSource | null;
	stack: string | null;
};

export type ViewerErrorSource = {
	column: number | null;
	filePath: string | null;
	line: number | null;
};

export type ParsedErrorLocation = {
	location: string;
	source: ViewerErrorSource;
};

const DEFAULT_VIEWER_ERROR_TITLE = 'Three.js viewer error';
const DEFAULT_VIEWER_ERROR_MESSAGE = 'The preview failed to render.';

export function toViewerError(error: unknown): ViewerError {
	const message = getErrorMessage(error);
	const stack = formatViewerErrorForConsole(error);
	const parsedLocation = extractErrorLocation(stack ?? undefined);

	return {
		title: DEFAULT_VIEWER_ERROR_TITLE,
		message,
		location: parsedLocation?.location ?? null,
		source: parsedLocation?.source ?? null,
		stack
	};
}

export function formatViewerErrorForConsole(error: unknown): string | null {
	if (error instanceof Error) {
		return error.stack ?? `${error.name}: ${error.message}`;
	}

	if (typeof error === 'string') {
		return error;
	}

	if (error === null || error === undefined) {
		return null;
	}

	try {
		return JSON.stringify(error, null, 2);
	} catch {
		return String(error);
	}
}

export function extractErrorLocation(stack?: string): ParsedErrorLocation | null {
	if (!stack) {
		return null;
	}

	const lines = stack.split('\n');

	for (const line of lines) {
		const match = line.match(
			/((?:blob:|https?:\/\/|file:\/\/|\/)[^)\s]+|[A-Za-z0-9._/-]+\.(?:[cm]?[jt]s|svelte)):(\d+):(\d+)/
		);

		if (match) {
			const [, filePath, lineNumber, columnNumber] = match;

			return {
				location: `${filePath}:${lineNumber}:${columnNumber}`,
				source: {
					column: Number(columnNumber),
					filePath,
					line: Number(lineNumber)
				}
			};
		}
	}

	return null;
}

export function formatErrorSourceLocation(source: ViewerErrorSource | null): string | null {
	if (!source?.filePath || !source.line) {
		return null;
	}

	if (!source.column) {
		return `${source.filePath}:${source.line}`;
	}

	return `${source.filePath}:${source.line}:${source.column}`;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message || DEFAULT_VIEWER_ERROR_MESSAGE;
	}

	if (typeof error === 'string') {
		return error;
	}

	if (error === null || error === undefined) {
		return DEFAULT_VIEWER_ERROR_MESSAGE;
	}

	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}
