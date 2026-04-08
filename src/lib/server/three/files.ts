/**
 * Purpose: Provide managed file access for the editable `static/three` demo sources.
 * Context: The Three editor page should list, read, and save demo files without exposing arbitrary filesystem access.
 * Responsibility: Guard paths, enumerate editable files, and read, persist, or create text documents under the managed root.
 * Boundaries: Preview builds and client-side editor state live in dedicated modules.
 */

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';

import type { ThreeSourceDocument, ThreeSourceFileSummary } from '$lib/three/three-editor-types';
import type { ThreeCreateFileRequest, ThreeCreateFileResult } from '$lib/three/three-template-types';

import { STATIC_THREE_DIR, toManagedRelativePath } from './paths';

const DEFAULT_PREVIEW_ENTRY_PATH = 'cube.ts';
const DEFAULT_LIST_EXCLUDE_PREFIXES = ['shared/', 'templates/'];
const TEMPLATE_PREFIX = 'templates/';

export type ThreeFileService = {
	createManagedFile: (request: ThreeCreateFileRequest) => Promise<ThreeCreateFileResult>;
	listFiles: () => Promise<ThreeSourceFileSummary[]>;
	readManagedFile: (filePath: string) => Promise<ThreeSourceDocument>;
	saveManagedFile: (document: ThreeSourceDocument) => Promise<ThreeSourceDocument>;
};

export function createThreeFileService(
	rootDir: string = STATIC_THREE_DIR,
	previewEntryPath: string = DEFAULT_PREVIEW_ENTRY_PATH,
	options?: {
		listExcludePrefixes?: string[];
	}
): ThreeFileService {
	const normalizedRootDir = resolve(rootDir);
	const listExcludePrefixes = options?.listExcludePrefixes ?? DEFAULT_LIST_EXCLUDE_PREFIXES;

	return {
		listFiles: async () => {
			const filePaths = await listManagedFiles(normalizedRootDir, normalizedRootDir, {
				excludePrefixes: listExcludePrefixes
			});

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

		createManagedFile: async (request) => {
			const outputPath = await createUniqueScenePath(normalizedRootDir, request.fileName);
			const absolutePath = resolveManagedFilePath(normalizedRootDir, outputPath);
			const content =
				request.mode === 'blank'
					? createBlankManagedSceneSource(request.fileName)
					: await readTemplateSource(normalizedRootDir, request.templatePath);

			await mkdir(dirname(absolutePath), { recursive: true });
			await writeFile(absolutePath, content, 'utf-8');

			return {
				content,
				path: outputPath
			} satisfies ThreeCreateFileResult;
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

async function readTemplateSource(rootDir: string, templatePath: string): Promise<string> {
	const normalizedTemplatePath = normalizeRequestedPath(templatePath);

	if (!normalizedTemplatePath.startsWith(TEMPLATE_PREFIX)) {
		throw new Error('Template path must point to a file under static/three/templates.');
	}

	return readFile(resolveManagedFilePath(rootDir, normalizedTemplatePath), 'utf-8');
}

export async function listManagedFiles(
	rootDir: string,
	currentDir: string = rootDir,
	options?: {
		excludePrefixes?: string[];
	}
): Promise<string[]> {
	const entries = await readdir(currentDir, { withFileTypes: true });
	const filePaths: string[] = [];
	const excludePrefixes = options?.excludePrefixes ?? [];

	for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const absolutePath = resolve(currentDir, entry.name);
		const relativePath = toManagedRelativePath(rootDir, absolutePath);

		if (excludePrefixes.some((prefix) => relativePath === prefix.slice(0, -1) || relativePath.startsWith(prefix))) {
			continue;
		}

		if (entry.isDirectory()) {
			filePaths.push(
				...(await listManagedFiles(rootDir, absolutePath, {
					excludePrefixes
				}))
			);
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

async function createUniqueScenePath(rootDir: string, fileName: string): Promise<string> {
	const normalizedName = slugifyFileName(fileName);
	const baseName = normalizedName.replace(/\.ts$/, '');
	const scenesDir = 'scenes';

	for (let index = 0; index < 1000; index += 1) {
		const suffix = index === 0 ? '' : `-${index + 1}`;
		const candidatePath = `${scenesDir}/${baseName}${suffix}.ts`;

		try {
			await stat(resolveManagedFilePath(rootDir, candidatePath));
		} catch {
			return candidatePath;
		}
	}

	throw new Error('Unable to find a unique file path under static/three/scenes.');
}

function createBlankManagedSceneSource(fileName: string): string {
	const sceneTitle = toSceneTitle(fileName);

	return `/**
 * Purpose: Provide a minimal editable Three.js scene starter for the template workbench.
 * Context: New blank workbench files should be valid preview entries without requiring any optional template metadata.
 * Responsibility: Define one small rotating cube scene plus cleanup logic for further customization.
 * Boundaries: This starter does not include template parameters, additional assets, or route-specific behavior.
 */

import {
\tAmbientLight,
\tBoxGeometry,
\tColor,
\tDirectionalLight,
\tMesh,
\tMeshStandardMaterial
} from 'three';

import type {
\tThreeDemoSceneController,
\tThreeDemoSceneFactory
} from '../../../src/lib/three/three-demo-scene';

const BACKGROUND = '#020617';
const CUBE_COLOR = '#60a5fa';
const ROTATION_SPEED = 0.01;

export const createDemoScene: ThreeDemoSceneFactory = ({ camera, scene }): ThreeDemoSceneController => {
\tconst geometry = new BoxGeometry(1.2, 1.2, 1.2);
\tconst material = new MeshStandardMaterial({
\t\tcolor: CUBE_COLOR,
\t\tmetalness: 0.22,
\t\troughness: 0.38
\t});
\tconst cube = new Mesh(geometry, material);
\tconst ambientLight = new AmbientLight('#ffffff', 2.4);
\tconst directionalLight = new DirectionalLight('#ffffff', 2.8);

\tscene.background = new Color(BACKGROUND);
\tcamera.position.set(0, 0.8, 3.5);
\tdirectionalLight.position.set(3, 4, 5);
\tcube.name = '${sceneTitle}';

\tscene.add(ambientLight);
\tscene.add(directionalLight);
\tscene.add(cube);

\treturn {
\t\tupdate: () => {
\t\t\tcube.rotation.x += ROTATION_SPEED * 0.8;
\t\t\tcube.rotation.y += ROTATION_SPEED;
\t\t},
\t\tdispose: () => {
\t\t\tscene.remove(ambientLight);
\t\t\tscene.remove(directionalLight);
\t\t\tscene.remove(cube);
\t\t\tgeometry.dispose();
\t\t\tmaterial.dispose();
\t\t}
\t};
};
`;
}

function normalizeRequestedPath(filePath: string): string {
	return filePath.trim().replace(/^@/, '').replace(/^\.\//, '');
}

function slugifyFileName(fileName: string): string {
	const normalizedName = fileName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	if (normalizedName.length === 0) {
		return 'scene.ts';
	}

	return normalizedName.endsWith('.ts') ? normalizedName : `${normalizedName}.ts`;
}

function toSceneTitle(fileName: string): string {
	return fileName
		.trim()
		.replace(/\.ts$/i, '')
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (value) => value.toUpperCase());
}
