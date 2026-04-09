/**
 * Purpose: Define the shared template metadata and file-creation types for the editor workspace.
 * Context: Client and server modules need one stable contract for optional scene headers, parameter controls, and new file creation.
 * Responsibility: Provide serializable type definitions only, without parsing or filesystem behavior.
 * Boundaries: This module does not inspect source files, render any UI, or perform managed file writes.
 */

export type ThreeTemplateRendererKind = 'webgl' | 'webgpu';

export type ThreeTemplateParameterValue = number | string;

export type ThreeTemplateRangeParameterDefinition = {
	control: 'range';
	defaultValue: number;
	key: string;
	label: string;
	max: number;
	min: number;
	step?: number;
};

export type ThreeTemplateSelectParameterDefinition = {
	control: 'select';
	defaultValue: ThreeTemplateParameterValue;
	key: string;
	label: string;
	options: Array<{
		label: string;
		value: ThreeTemplateParameterValue;
	}>;
};

export type ThreeTemplateTextParameterDefinition = {
	control: 'text';
	defaultValue: string;
	key: string;
	label: string;
	placeholder?: string;
};

export type ThreeTemplateColorParameterDefinition = {
	control: 'color';
	defaultValue: string;
	key: string;
	label: string;
};

export type ThreeTemplateParameterDefinition =
	| ThreeTemplateColorParameterDefinition
	| ThreeTemplateRangeParameterDefinition
	| ThreeTemplateSelectParameterDefinition
	| ThreeTemplateTextParameterDefinition;

export type ThreeTemplateHeader = {
	description: string;
	id: string;
	parameters: ThreeTemplateParameterDefinition[];
	rendererKind: ThreeTemplateRendererKind;
	tags: string[];
	title: string;
};

export type ThreeTemplateSummary = {
	description: string;
	id: string;
	parameters: ThreeTemplateParameterDefinition[];
	path: string;
	rendererKind: ThreeTemplateRendererKind;
	tags: string[];
	title: string;
};

export type ThreeTemplateSourceDetails = {
	header: ThreeTemplateHeader | null;
	parameters: Record<string, ThreeTemplateParameterValue> | null;
};

export type ThreeCreateBlankFileRequest = {
	fileName: string;
	mode: 'blank';
};

export type ThreeCreateTemplateFileRequest = {
	fileName: string;
	mode: 'template';
	templatePath: string;
};

export type ThreeCreateFileRequest = ThreeCreateBlankFileRequest | ThreeCreateTemplateFileRequest;

export type ThreeCreateFileResult = {
	content: string;
	path: string;
};
