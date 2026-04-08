/**
 * Purpose: Build browser-runnable Three preview modules from editable `static/three` source files.
 * Context: The editor demo needs immediate live preview updates from in-memory TypeScript changes.
 * Responsibility: Bundle the preview entry with optional in-memory file overrides and normalize build failures.
 * Boundaries: This module does not persist files or manage browser-side module loading.
 */

import { build } from 'esbuild';
import { dirname, resolve } from 'node:path';

import type { ThreePreviewBuildRequest, ThreePreviewBuildResult } from '$lib/three/three-editor-types';

import { resolveManagedFilePath } from './files';
import { normalizePreviewSourceMap } from './preview-source-map';
import { STATIC_THREE_DIR } from './paths';
import { toThreePreviewError } from './preview-errors';

export type ThreePreviewBuilder = {
	buildPreview: (request: ThreePreviewBuildRequest) => Promise<ThreePreviewBuildResult>;
};

const BUILD_TARGET = ['es2020'];

export function createThreePreviewBuilder(rootDir: string = STATIC_THREE_DIR): ThreePreviewBuilder {
	const normalizedRootDir = resolve(rootDir);

	return {
		buildPreview: async (request: ThreePreviewBuildRequest) => {
			const absoluteEntryPath = resolveManagedFilePath(normalizedRootDir, request.entryPath);
			const overrides = new Map<string, string>();

			for (const file of request.files) {
				overrides.set(resolveManagedFilePath(normalizedRootDir, file.path), file.content);
			}

			try {
				const result = await build({
					bundle: true,
					format: 'esm',
					stdin: overrides.has(absoluteEntryPath)
						? {
								contents: overrides.get(absoluteEntryPath)!,
								loader: 'ts',
								resolveDir: dirname(absoluteEntryPath),
								sourcefile: absoluteEntryPath
							}
						: undefined,
					entryPoints: overrides.has(absoluteEntryPath) ? undefined : [absoluteEntryPath],
					logLevel: 'silent',
					outfile: 'preview.js',
					platform: 'browser',
					plugins: [
						{
							name: 'three-editor-overrides',
							setup(buildContext) {
								buildContext.onLoad({ filter: /\.[cm]?[jt]s$/ }, async (args) => {
									if (!args.path.startsWith(`${normalizedRootDir}/`)) {
										return null;
									}

									const override = overrides.get(args.path);

									if (override === undefined) {
										return null;
									}

									return {
										contents: override,
										loader: 'ts'
									};
								});
							}
						}
					],
					sourcemap: 'external',
					target: BUILD_TARGET,
					write: false
				});

				const bundledFile = result.outputFiles?.find((file) => file.path.endsWith('preview.js'));
				const sourceMapFile = result.outputFiles?.find((file) => file.path.endsWith('preview.js.map'));

				if (!bundledFile || !sourceMapFile) {
					throw new Error('Preview build did not produce a JavaScript output file and source map.');
				}

				return {
					code: bundledFile.text,
					entryPath: request.entryPath,
					map: normalizePreviewSourceMap(normalizedRootDir, sourceMapFile.text),
					status: 'success'
				} satisfies ThreePreviewBuildResult;
			} catch (error) {
				return {
					entryPath: request.entryPath,
					error: toThreePreviewError(error, normalizedRootDir),
					status: 'error'
				} satisfies ThreePreviewBuildResult;
			}
		}
	};
}
