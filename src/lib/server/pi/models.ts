import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { PI_SETTINGS_PATH } from './paths';

export type PiModelDefinition = {
	id: string;
	name: string;
	openRouterUrl: string;
	contextWindow: string;
	inputCost: string;
	outputCost: string;
	capabilities: string[];
};

type PiSettings = {
	selectedModelId?: string;
};

export const PI_MODELS: PiModelDefinition[] = [
	{
		id: 'minimax/minimax-m2.7',
		name: 'MiniMax M2.7',
		openRouterUrl: 'https://openrouter.ai/minimax/minimax-m2.7',
		contextWindow: '204,800',
		inputCost: '$0.30 / 1M',
		outputCost: '$1.20 / 1M',
		capabilities: ['multi-agent workflows', 'debugging', 'document generation', 'long context']
	},
	{
		id: 'moonshotai/kimi-k2.5',
		name: 'Kimi K2.5',
		openRouterUrl: 'https://openrouter.ai/moonshotai/kimi-k2.5',
		contextWindow: '262,144',
		inputCost: '$0.3827 / 1M',
		outputCost: '$1.72 / 1M',
		capabilities: ['multimodal', 'visual coding', 'reasoning', 'agentic tool calling']
	},
	{
		id: 'deepseek/deepseek-v3.2',
		name: 'DeepSeek V3.2',
		openRouterUrl: 'https://openrouter.ai/deepseek/deepseek-v3.2',
		contextWindow: '163,840',
		inputCost: '$0.26 / 1M',
		outputCost: '$0.38 / 1M',
		capabilities: ['reasoning', 'agentic tool use', 'long context efficiency', 'coding']
	},
	{
		id: 'z-ai/glm-5v-turbo',
		name: 'GLM 5V Turbo',
		openRouterUrl: 'https://openrouter.ai/z-ai/glm-5v-turbo',
		contextWindow: '202,752',
		inputCost: '$1.20 / 1M',
		outputCost: '$4.00 / 1M',
		capabilities: ['multimodal', 'image and video input', 'vision coding', 'agent execution']
	},
	{
		id: 'z-ai/glm-5',
		name: 'GLM 5',
		openRouterUrl: 'https://openrouter.ai/z-ai/glm-5',
		contextWindow: '80,000',
		inputCost: '$0.72 / 1M',
		outputCost: '$2.30 / 1M',
		capabilities: ['systems design', 'backend reasoning', 'agent planning', 'coding']
	}
];

const DEFAULT_MODEL_ID = PI_MODELS[0].id;

function ensureSettingsDir(): void {
	const settingsDir = dirname(PI_SETTINGS_PATH);

	if (!existsSync(settingsDir)) {
		mkdirSync(settingsDir, { recursive: true, mode: 0o700 });
	}
}

function readSettings(): PiSettings {
	try {
		if (!existsSync(PI_SETTINGS_PATH)) {
			return {};
		}

		return JSON.parse(readFileSync(PI_SETTINGS_PATH, 'utf-8')) as PiSettings;
	} catch {
		return {};
	}
}

function writeSettings(settings: PiSettings): void {
	ensureSettingsDir();
	writeFileSync(PI_SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
	chmodSync(PI_SETTINGS_PATH, 0o600);
}

export function getConfiguredModelId(): string {
	const selectedModelId = readSettings().selectedModelId;

	return PI_MODELS.some((model) => model.id === selectedModelId) ? selectedModelId! : DEFAULT_MODEL_ID;
}

export function getConfiguredModel(): PiModelDefinition {
	return getPiModel(getConfiguredModelId());
}

export function getPiModel(modelId: string): PiModelDefinition {
	const model = PI_MODELS.find((candidate) => candidate.id === modelId);

	if (!model) {
		throw new Error('Unknown model selection.');
	}

	return model;
}

export function setConfiguredModel(modelId: string): PiModelDefinition {
	const model = getPiModel(modelId);
	writeSettings({ selectedModelId: model.id });
	return model;
}
