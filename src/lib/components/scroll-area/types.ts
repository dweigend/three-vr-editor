import type { ScrollArea, WithElementRef } from 'bits-ui';

export type ScrollAreaProps = WithElementRef<ScrollArea.RootProps, HTMLDivElement> & {
	viewportClass?: string;
};
