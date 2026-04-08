/** Public prop types for the scroll-area primitive family. */
import type { ScrollArea, WithElementRef } from 'bits-ui';

export type ScrollAreaProps = WithElementRef<ScrollArea.RootProps, HTMLDivElement> & {
	viewportClass?: string;
};
