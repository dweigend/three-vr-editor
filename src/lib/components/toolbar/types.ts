/** Public prop types for the toolbar primitive family. */
import type { ComponentProps } from 'svelte';

import ToolbarButton from './components/toolbar-button.svelte';
import ToolbarRoot from './components/toolbar-root.svelte';

export type ToolbarRootProps = ComponentProps<typeof ToolbarRoot>;
export type ToolbarButtonProps = ComponentProps<typeof ToolbarButton>;
