export interface BookmarkSection {
  title: string;
  page: number;
}

export interface FlipbookMetadata {
  id: string;
  name: string;
  title: string;
  url: string;
  pdfUrl: string;
  totalPages: number;
  thumbnailUrl: string;
  sections: BookmarkSection[];
}

export type ViewMode = 'heyzine' | 'realistic-3d' | 'slide';

export interface AutoFlipConfig {
  enabled: boolean;
  delaySeconds: number; // e.g. 5 seconds
  loop: boolean;
  direction: 'forward' | 'backward';
  step: 1 | 2; // single page vs 2 pages
  pauseOnHover: boolean;
  soundEnabled: boolean;
  volume: number; // 0 to 1
  autoStartOnLoad: boolean;
}
