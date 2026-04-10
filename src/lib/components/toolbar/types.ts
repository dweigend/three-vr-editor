import type { ComponentProps } from 'svelte';

import ToolbarButton from './components/toolbar-button.svelte';
import ToolbarGroup from './components/toolbar-group.svelte';
import ToolbarGroupItem from './components/toolbar-group-item.svelte';
import ToolbarRoot from './components/toolbar-root.svelte';

export type ToolbarRootProps = ComponentProps<typeof ToolbarRoot>;
export type ToolbarButtonProps = ComponentProps<typeof ToolbarButton>;
export type ToolbarGroupProps = ComponentProps<typeof ToolbarGroup>;
export type ToolbarGroupItemProps = ComponentProps<typeof ToolbarGroupItem>;
