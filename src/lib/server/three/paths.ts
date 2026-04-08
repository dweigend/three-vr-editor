/**
 * Purpose: Centralize the managed filesystem root for editable Three demo files.
 * Context: Multiple server-side modules need the same absolute path to `static/three`.
 * Responsibility: Export one stable root path plus shared path-normalization helpers for file and preview services.
 * Boundaries: This file does not perform file I/O, build previews, or handle routes.
 */

import { realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

export const STATIC_THREE_DIR = resolve(process.cwd(), 'static', 'three');
export const STATIC_THREE_SCENES_DIR = resolve(STATIC_THREE_DIR, 'scenes');
export const STATIC_THREE_SHARED_DIR = resolve(STATIC_THREE_DIR, 'shared');
export const STATIC_THREE_TEMPLATES_DIR = resolve(STATIC_THREE_DIR, 'templates');

export function toManagedRelativePath(rootDir: string, filePath: string): string {
	const normalizedRootDir = toRealPath(resolve(rootDir));
	const normalizedPath = normalizePathSeparators(filePath);
	const managedPrefix = `${normalizedRootDir}/`;
	const candidatePaths = isAbsolute(filePath)
		? [toRealPath(resolve(filePath))]
		: [toRealPath(resolve(process.cwd(), filePath)), toRealPath(resolve(normalizedRootDir, filePath))];

	for (const absolutePath of candidatePaths) {
		if (absolutePath === normalizedRootDir || absolutePath.startsWith(managedPrefix)) {
			return normalizePathSeparators(relative(normalizedRootDir, absolutePath));
		}
	}

	return normalizedPath.replace(/^\.\//, '');
}

function normalizePathSeparators(filePath: string): string {
	return filePath.split('\\').join('/');
}

function toRealPath(filePath: string): string {
	try {
		return realpathSync(filePath);
	} catch {
		return filePath;
	}
}
