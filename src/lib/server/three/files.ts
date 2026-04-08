/**
 * Purpose: Provide managed file access for the editable `static/three` demo sources.
 * Context: The Three editor page should list, read, and save demo files without exposing arbitrary filesystem access.
 * Responsibility: Guard paths, enumerate files, and read or persist text documents under the managed root.
 * Boundaries: Preview builds and client-side editor state live in dedicated modules.
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

import type { ThreeSourceDocument, ThreeSourceFileSummary } from '$lib/three/three-editor-types';

import { STATIC_THREE_DIR, toManagedRelativePath } from './paths';

const DEFAULT_PREVIEW_ENTRY_PATH = 'cube.ts';

export type ThreeFileService = {
	listFiles: () => Promise<ThreeSourceFileSummary[]>;
	readManagedFile: (filePath: string) => Promise<ThreeSourceDocument>;
	saveManagedFile: (document: ThreeSourceDocument) => Promise<ThreeSourceDocument>;
};

export function createThreeFileService(
	rootDir: string = STATIC_THREE_DIR,
	previewEntryPath: string = DEFAULT_PREVIEW_ENTRY_PATH
): ThreeFileService {
	const normalizedRootDir = resolve(rootDir);

	return {
		listFiles: async () => {
			const filePaths = await listManagedFiles(normalizedRootDir);

			return filePaths.map((filePath) => {
				const name = basename(filePath);

				return {
					extension: extname(filePath),
					isPreviewEntry: filePath === previewEntryPath,
					isPreviewRelevant: extname(filePath) === '.ts',
					name,
					path: filePath
				} satisfies ThreeSourceFileSummary;
			});
		},

		readManagedFile: async (filePath: string) => {
			const absolutePath = resolveManagedFilePath(normalizedRootDir, filePath);
			const contents = await readFile(absolutePath, 'utf-8');

			return {
				content: contents,
				path: filePath
			} satisfies ThreeSourceDocument;
		},

		saveManagedFile: async (document: ThreeSourceDocument) => {
			const absolutePath = resolveManagedFilePath(normalizedRootDir, document.path);
			await stat(absolutePath);
			await writeFile(absolutePath, document.content, 'utf-8');

			return document;
		}
	};
}

async function listManagedFiles(rootDir: string, currentDir: string = rootDir): Promise<string[]> {
	const entries = await readdir(currentDir, { withFileTypes: true });
	const filePaths: string[] = [];

	for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const absolutePath = resolve(currentDir, entry.name);

		if (entry.isDirectory()) {
			filePaths.push(...(await listManagedFiles(rootDir, absolutePath)));
			continue;
		}

		if (!entry.isFile()) {
			continue;
		}

		filePaths.push(toManagedRelativePath(rootDir, absolutePath));
	}

	return filePaths;
}

export function resolveManagedFilePath(rootDir: string, filePath: string): string {
	const absoluteRoot = resolve(rootDir);
	const absolutePath = resolve(absoluteRoot, filePath);
	const managedPrefix = `${absoluteRoot}/`;

	if (absolutePath !== absoluteRoot && !absolutePath.startsWith(managedPrefix)) {
		throw new Error('File path is outside the managed static/three directory.');
	}

	return absolutePath;
}
