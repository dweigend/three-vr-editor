import type { Message } from 'esbuild';

import {
	formatErrorSourceLocation,
	toViewerError,
	type ViewerError
} from '$lib/features/editor/three-viewer-errors';

import { toManagedRelativePath } from './paths';

type EsbuildFailure = {
	errors?: Message[];
};

export function toThreePreviewError(error: unknown, rootDir: string): ViewerError {
	if (isEsbuildFailure(error) && error.errors.length > 0) {
		return toViewerErrorFromMessage(error.errors[0], rootDir);
	}

	return toViewerError(error);
}

function isEsbuildFailure(error: unknown): error is Required<EsbuildFailure> {
	return typeof error === 'object' && error !== null && Array.isArray((error as EsbuildFailure).errors);
}

function toViewerErrorFromMessage(message: Message, rootDir: string): ViewerError {
	const source = message.location
		? {
				column: message.location.column + 1,
				filePath: toManagedRelativePath(rootDir, message.location.file),
				line: message.location.line
			}
		: null;
	const notes = message.notes.map((note) => note.text.trim()).filter((text) => text.length > 0);
	const stack = [message.text, ...notes].join('\n\n');

	return {
		title: 'Three.js preview build error',
		message: message.text,
		location: formatErrorSourceLocation(source),
		source,
		stack: stack.length > 0 ? stack : null
	};
}
