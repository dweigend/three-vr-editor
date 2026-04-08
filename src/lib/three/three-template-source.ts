/**
 * Purpose: Parse and update the optional template metadata blocks embedded in managed Three scene files.
 * Context: The new template workbench needs one reusable source-of-truth for optional scene headers and parameter blocks.
 * Responsibility: Read optional metadata, return null when no template block exists, and rewrite only the managed parameter section.
 * Boundaries: This module does not access the filesystem, render controls, or validate whether a source file is a complete scene.
 */

import type {
	ThreeTemplateHeader,
	ThreeTemplateParameterValue,
	ThreeTemplateSourceDetails
} from './three-template-types';

const TEMPLATE_HEADER_PATTERN = /\/\*\s*@three-template\s*([\s\S]*?)\*\//m;
const TEMPLATE_PARAMETERS_PATTERN =
	/\/\/\s*@three-template-parameters:start\s*export const templateParameters = (\{[\s\S]*?\}) satisfies Record<string, number \| string>;\s*\/\/\s*@three-template-parameters:end/m;

export function readThreeTemplateSourceDetails(source: string): ThreeTemplateSourceDetails {
	return {
		header: readThreeTemplateHeader(source),
		parameters: readThreeTemplateParameters(source)
	};
}

export function readThreeTemplateHeader(source: string): ThreeTemplateHeader | null {
	const match = TEMPLATE_HEADER_PATTERN.exec(source);

	if (!match) {
		return null;
	}

	return JSON.parse(match[1].trim()) as ThreeTemplateHeader;
}

export function readThreeTemplateParameters(
	source: string
): Record<string, ThreeTemplateParameterValue> | null {
	const match = TEMPLATE_PARAMETERS_PATTERN.exec(source);

	if (!match) {
		return null;
	}

	return JSON.parse(match[1]) as Record<string, ThreeTemplateParameterValue>;
}

export function writeThreeTemplateParameters(
	source: string,
	nextParameters: Record<string, ThreeTemplateParameterValue>
): string {
	if (!TEMPLATE_PARAMETERS_PATTERN.test(source)) {
		return source;
	}

	const serializedParameters = JSON.stringify(nextParameters, null, '\t');
	const nextBlock = [
		'// @three-template-parameters:start',
		`export const templateParameters = ${serializedParameters} satisfies Record<string, number | string>;`,
		'// @three-template-parameters:end'
	].join('\n');

	return source.replace(TEMPLATE_PARAMETERS_PATTERN, nextBlock);
}

export function hasThreeTemplateHeader(source: string): boolean {
	return TEMPLATE_HEADER_PATTERN.test(source);
}
