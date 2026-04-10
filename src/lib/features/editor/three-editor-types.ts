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
