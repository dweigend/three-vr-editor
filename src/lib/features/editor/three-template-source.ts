import { runInNewContext } from 'node:vm';

import type {
	ThreeTemplateHeader,
	ThreeTemplateParameterMap,
	ThreeTemplateParameterValue,
	ThreeTemplateSourceDetails
} from './three-template-types';

const TEMPLATE_UI_PATTERN =
	/export const templateUi = defineThreeTemplateUi\(\s*(\{[\s\S]*?\})\s*\);/m;
const TEMPLATE_HEADER_PATTERN = /\/\*\s*@three-template\s*([\s\S]*?)\*\//m;
const TEMPLATE_PARAMETERS_HELPER_PATTERN =
	/export const templateParameters = defineThreeTemplateParameters\(\s*(\{[\s\S]*?\})\s*\);/m;
const TEMPLATE_PARAMETERS_COMMENT_PATTERN =
	/\/\/\s*@three-template-parameters:start\s*export const templateParameters = (\{[\s\S]*?\}) satisfies Record<string, number \| string>;\s*\/\/\s*@three-template-parameters:end/m;

export function readThreeTemplateSourceDetails(source: string): ThreeTemplateSourceDetails {
	return {
		header: readThreeTemplateHeader(source),
		parameters: readThreeTemplateParameters(source)
	};
}

export function readThreeTemplateHeader(source: string): ThreeTemplateHeader | null {
	const templateUiMatch = TEMPLATE_UI_PATTERN.exec(source);

	if (templateUiMatch) {
		return parseTemplateObjectLiteral<ThreeTemplateHeader>(templateUiMatch[1]);
	}

	const match = TEMPLATE_HEADER_PATTERN.exec(source);

	if (!match) {
		return null;
	}

	return parseTemplateObjectLiteral<ThreeTemplateHeader>(match[1]);
}

export function readThreeTemplateParameters(
	source: string
): ThreeTemplateParameterMap | null {
	const helperMatch = TEMPLATE_PARAMETERS_HELPER_PATTERN.exec(source);

	if (helperMatch) {
		return parseTemplateObjectLiteral<ThreeTemplateParameterMap>(helperMatch[1]);
	}

	const match = TEMPLATE_PARAMETERS_COMMENT_PATTERN.exec(source);

	if (!match) {
		return null;
	}

	return parseTemplateObjectLiteral<ThreeTemplateParameterMap>(match[1]);
}

export function writeThreeTemplateParameters(
	source: string,
	nextParameters: ThreeTemplateParameterMap
): string {
	const serializedParameters = JSON.stringify(nextParameters, null, '\t');
	const helperBlock =
		`export const templateParameters = defineThreeTemplateParameters(${serializedParameters});`;
	const commentBlock = [
		'// @three-template-parameters:start',
		`export const templateParameters = ${serializedParameters} satisfies Record<string, number | string>;`,
		'// @three-template-parameters:end'
	].join('\n');

	if (TEMPLATE_PARAMETERS_HELPER_PATTERN.test(source)) {
		return source.replace(TEMPLATE_PARAMETERS_HELPER_PATTERN, helperBlock);
	}

	if (TEMPLATE_PARAMETERS_COMMENT_PATTERN.test(source)) {
		return source.replace(TEMPLATE_PARAMETERS_COMMENT_PATTERN, commentBlock);
	}

	return source;
}

export function hasThreeTemplateHeader(source: string): boolean {
	return TEMPLATE_UI_PATTERN.test(source) || TEMPLATE_HEADER_PATTERN.test(source);
}

function parseTemplateObjectLiteral<TValue>(source: string): TValue {
	const parsedValue = runInNewContext(`(${source.trim()})`, {}, { timeout: 100 });

	if (!isRecord(parsedValue)) {
		throw new SyntaxError('Template metadata must evaluate to an object literal.');
	}

	return parsedValue as TValue;
}

function isRecord(value: unknown): value is Record<string, ThreeTemplateParameterValue> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
