/**
 * Shared Three.js module URLs for the editor runtime and preview bundles.
 * This keeps both sides on the same browser module instances and avoids
 * duplicate Three.js copies inside the editor window.
 */

export const THREE_RUNTIME_ROUTE_BASE = '/editor/runtime/three';
export const THREE_CORE_MODULE_URL = `${THREE_RUNTIME_ROUTE_BASE}/three.core.js`;
export const THREE_MODULE_URL = `${THREE_RUNTIME_ROUTE_BASE}/three.module.js`;
export const THREE_WEBGPU_MODULE_URL = `${THREE_RUNTIME_ROUTE_BASE}/three.webgpu.js`;

export const THREE_RUNTIME_FILE_NAMES = [
	'three.core.js',
	'three.module.js',
	'three.webgpu.js'
] as const;

export function toAbsoluteThreeRuntimeModuleUrl(moduleUrl: string, baseUrl: string): string {
	return new URL(moduleUrl, baseUrl).href;
}
