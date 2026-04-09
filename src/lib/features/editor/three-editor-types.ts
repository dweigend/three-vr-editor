/**
 * Purpose: Share the small file and preview payload types used by the Three editor workflow.
 * Context: The editor route coordinates client and server modules around `static/three`.
 * Responsibility: Define stable request and response shapes for file loading, saving, and preview builds.
 * Boundaries: This file contains type definitions only and no runtime behavior.
 */

import type { ViewerError } from './three-viewer-errors';

export type ThreeSourceFileSummary = {
	extension: string;
	isPreviewEntry: boolean;
	isPreviewRelevant: boolean;
	name: string;
	path: string;
};

export type ThreeSourceDocument = {
	content: string;
	path: string;
};

export type ThreePreviewBuildRequest = {
	entryPath: string;
	files: ThreeSourceDocument[];
};

export type ThreePreviewBuildSuccess = {
	code: string;
	entryPath: string;
	map: string;
	status: 'success';
};

export type ThreePreviewBuildFailure = {
	entryPath: string;
	error: ViewerError;
	status: 'error';
};

export type ThreePreviewBuildResult = ThreePreviewBuildSuccess | ThreePreviewBuildFailure;
