/**
 * Purpose: Expose the public prop type for the text-input primitive.
 * Context: Consumers should import the family prop type without reaching into internal implementation files.
 * Responsibility: Re-export the component prop shape from the public family boundary.
 * Boundaries: This file contains types only.
 */

import type { ComponentProps } from 'svelte';

import TextInput from './components/text-input.svelte';

export type TextInputProps = ComponentProps<typeof TextInput>;
