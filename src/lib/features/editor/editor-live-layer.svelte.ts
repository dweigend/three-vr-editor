import type { ThreeEditorActiveFileContext } from './three-editor-workspace-types';
import {
	createEmptyEditorLiveDiscoveryResult,
	discoverEditorLiveParameters
} from './editor-live-layer-discovery';
import type {
	EditorLiveDiscoveryResult,
	EditorLiveEditableParameter,
	EditorLiveLayerConsumer,
	EditorLiveLayerMode,
	EditorLiveOverrideMap,
	EditorLiveResolvedParameter
} from './editor-live-layer-types';
import type { ThreeTemplateParameterValue } from './three-template-types';

type EditorLiveLayerConsumerFlags = Record<EditorLiveLayerConsumer, boolean>;

export type EditorLiveLayerState = {
	readonly activePath: string | null;
	readonly discovery: EditorLiveDiscoveryResult;
	readonly editableParameters: EditorLiveEditableParameter[];
	readonly isActive: boolean;
	readonly mode: EditorLiveLayerMode;
	readonly overrides: EditorLiveOverrideMap;
	readonly resolvedParameters: EditorLiveResolvedParameter[];
	clearOverrides(): void;
	removeOverride(key: string): void;
	reset(): void;
	setConsumerActive(consumer: EditorLiveLayerConsumer, active: boolean): void;
	setOverride(key: string, value: ThreeTemplateParameterValue): void;
	syncActiveFileContext(context: ThreeEditorActiveFileContext | null): void;
};

/**
 * Shared browser-side live layer for optional interactive editor modules.
 * The layer stays inert until a consumer explicitly activates it.
 */
export const editorLiveLayer = createEditorLiveLayerState();

export function createEditorLiveLayerState(): EditorLiveLayerState {
	let activeFileContext = $state<ThreeEditorActiveFileContext | null>(null);
	let consumerFlags = $state<EditorLiveLayerConsumerFlags>(createInitialConsumerFlags());
	let discovery = $state<EditorLiveDiscoveryResult>(
		createEmptyEditorLiveDiscoveryResult(null, 'missing-template-header')
	);
	let overrides = $state<EditorLiveOverrideMap>({});

	const isActive = $derived(hasActiveConsumers(consumerFlags));
	const mode = $derived<EditorLiveLayerMode>(isActive ? 'active' : 'idle');
	const activePath = $derived(activeFileContext?.path ?? null);
	const editableParameters = $derived(discovery.editableParameters);
	const resolvedParameters = $derived.by<EditorLiveResolvedParameter[]>(() => {
		return discovery.editableParameters.map((parameter) => {
			const overrideValue = overrides[parameter.key];
			const hasOverride = overrideValue !== undefined;

			return {
				...parameter,
				hasOverride,
				overrideValue: hasOverride ? overrideValue : null,
				resolvedValue: hasOverride ? overrideValue : parameter.documentValue
			};
		});
	});

	function syncActiveFileContext(context: ThreeEditorActiveFileContext | null): void {
		const previousPath = activeFileContext?.path ?? null;
		const nextPath = context?.path ?? null;

		activeFileContext = context;

		if (!isActive) {
			clearOverrides();
			discovery = createEmptyEditorLiveDiscoveryResult(nextPath, 'missing-template-header');
			return;
		}

		if (previousPath !== nextPath) {
			clearOverrides();
		}

		rematerializeDiscovery();
	}

	function setConsumerActive(consumer: EditorLiveLayerConsumer, active: boolean): void {
		if (consumerFlags[consumer] === active) {
			return;
		}

		const nextConsumerFlags = {
			...consumerFlags,
			[consumer]: active
		};
		const nextIsActive = hasActiveConsumers(nextConsumerFlags);

		consumerFlags = nextConsumerFlags;

		if (!nextIsActive) {
			clearOverrides();
			discovery = createEmptyEditorLiveDiscoveryResult(activeFileContext?.path ?? null, 'missing-template-header');
			return;
		}

		rematerializeDiscovery();
	}

	function setOverride(key: string, value: ThreeTemplateParameterValue): void {
		if (!isActive || !hasEditableParameter(discovery, key)) {
			return;
		}

		overrides = {
			...overrides,
			[key]: value
		};
	}

	function removeOverride(key: string): void {
		if (!(key in overrides)) {
			return;
		}

		const { [key]: _removedOverride, ...nextOverrides } = overrides;
		overrides = nextOverrides;
	}

	function clearOverrides(): void {
		if (Object.keys(overrides).length === 0) {
			return;
		}

		overrides = {};
	}

	function reset(): void {
		activeFileContext = null;
		consumerFlags = createInitialConsumerFlags();
		discovery = createEmptyEditorLiveDiscoveryResult(null, 'missing-template-header');
		overrides = {};
	}

	function rematerializeDiscovery(): void {
		discovery = discoverEditorLiveParameters(activeFileContext);
		overrides = sanitizeOverrides(discovery, overrides);
	}

	return {
		get activePath() {
			return activePath;
		},
		get discovery() {
			return discovery;
		},
		get editableParameters() {
			return editableParameters;
		},
		get isActive() {
			return isActive;
		},
		get mode() {
			return mode;
		},
		get overrides() {
			return overrides;
		},
		get resolvedParameters() {
			return resolvedParameters;
		},
		clearOverrides,
		removeOverride,
		reset,
		setConsumerActive,
		setOverride,
		syncActiveFileContext
	};
}

function createInitialConsumerFlags(): EditorLiveLayerConsumerFlags {
	return {
		'control-panel': false,
		'node-editor': false
	};
}

function hasActiveConsumers(consumerFlags: EditorLiveLayerConsumerFlags): boolean {
	return consumerFlags['control-panel'] || consumerFlags['node-editor'];
}

function hasEditableParameter(discovery: EditorLiveDiscoveryResult, key: string): boolean {
	return discovery.editableParameters.some((parameter) => parameter.key === key);
}

function sanitizeOverrides(
	discovery: EditorLiveDiscoveryResult,
	overrides: EditorLiveOverrideMap
): EditorLiveOverrideMap {
	if (discovery.editableParameters.length === 0) {
		return {};
	}

	const editableKeys = new Set(discovery.editableParameters.map((parameter) => parameter.key));
	const nextOverrides = Object.entries(overrides).reduce<EditorLiveOverrideMap>(
		(result, [key, value]) => {
			if (editableKeys.has(key)) {
				result[key] = value;
			}

			return result;
		},
		{}
	);

	return nextOverrides;
}
