/**
 * Purpose: Hold shared family metadata for the text-input primitive.
 * Context: The component library keeps a small metadata module per family to stay aligned with the ui-system schema.
 * Responsibility: Expose a stable family identifier for documentation and tooling.
 * Boundaries: This module does not render UI or own runtime behavior.
 */

export const textInputFamily = {
	id: 'text-input'
} as const;
