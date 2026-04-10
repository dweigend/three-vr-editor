import type { ThreePreviewBuildResult, ThreeSourceFileSummary } from '../three-editor-types';

export const rangeScenePath = 'scenes/range.ts';
export const selectScenePath = 'scenes/select.ts';
export const plainScenePath = 'scenes/plain.ts';

export const rangeTemplateSource = `import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'range-scene',
\ttitle: 'Range Scene',
\tdescription: 'A scene with a size control.',
\trendererKind: 'webgl',
\ttags: ['geometry'],
\tparameters: [
\t\t{
\t\t\tkey: 'cubeSize',
\t\t\tlabel: 'Cube size',
\t\t\tcontrol: 'range',
\t\t\tmin: 0.5,
\t\t\tmax: 2,
\t\t\tstep: 0.1,
\t\t\tdefaultValue: 1
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\tcubeSize: 1.4
});
`;

export const selectTemplateSource = `import {
\tdefineThreeTemplateParameters,
\tdefineThreeTemplateUi
} from '$lib/features/editor/three-helpers';

export const templateUi = defineThreeTemplateUi({
\tid: 'select-scene',
\ttitle: 'Select Scene',
\tdescription: 'A scene with a select control.',
\trendererKind: 'webgl',
\ttags: ['materials'],
\tparameters: [
\t\t{
\t\t\tkey: 'renderMode',
\t\t\tlabel: 'Render mode',
\t\t\tcontrol: 'select',
\t\t\tdefaultValue: 'solid',
\t\t\toptions: [
\t\t\t\t{ label: 'Solid', value: 'solid' },
\t\t\t\t{ label: 'Wireframe', value: 'wireframe' }
\t\t\t]
\t\t}
\t]
});

export const templateParameters = defineThreeTemplateParameters({
\trenderMode: 'wireframe'
});
`;

export const plainSceneSource = `export const createDemoScene = () => ({ update() {}, dispose() {} });`;

export const selectedPathFlowFiles: ThreeSourceFileSummary[] = [
	{
		extension: '.ts',
		isPreviewEntry: true,
		isPreviewRelevant: true,
		name: 'range.ts',
		path: rangeScenePath
	},
	{
		extension: '.ts',
		isPreviewEntry: false,
		isPreviewRelevant: true,
		name: 'plain.ts',
		path: plainScenePath
	},
	{
		extension: '.ts',
		isPreviewEntry: false,
		isPreviewRelevant: true,
		name: 'select.ts',
		path: selectScenePath
	}
];

export const selectedPathFlowSourceByPath: Record<string, string> = {
	[plainScenePath]: plainSceneSource,
	[selectScenePath]: selectTemplateSource
};

export function createPreviewBuildResult(entryPath: string): ThreePreviewBuildResult {
	return {
		code: `export const entryPath = '${entryPath}';`,
		entryPath,
		map: '',
		status: 'success'
	};
}
