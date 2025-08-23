declare module 'react-image-gallery' {
  import * as React from 'react';

  export interface ReactImageGalleryItem {
    original: string;
    thumbnail?: string;
    originalAlt?: string;
    thumbnailAlt?: string;
    originalClass?: string;
    thumbnailClass?: string;
    description?: string;
    renderItem?: (item: ReactImageGalleryItem) => React.ReactNode;
    renderThumbInner?: (item: ReactImageGalleryItem) => React.ReactNode;
  }

  export interface ReactImageGalleryProps {
    items: ReactImageGalleryItem[];
    infinite?: boolean;
    lazyLoad?: boolean;
    showBullets?: boolean;
    showFullscreenButton?: boolean;
    showPlayButton?: boolean;
    showThumbnails?: boolean;
    showIndex?: boolean;
    showNav?: boolean;
    slideOnThumbnailOver?: boolean;
    thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right';
    startIndex?: number;
    onSlide?: (currentIndex: number) => void;
    additionalClass?: string;
  }

  export default class ReactImageGallery extends React.Component<ReactImageGalleryProps> {
    slideToIndex(index: number): void;
  }
}
