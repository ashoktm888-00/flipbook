import { FlipbookMetadata } from '../types';

export const DEFAULT_FLIPBOOK: FlipbookMetadata = {
  id: '1db987b0b7',
  name: '1db987b0b7fb34f82476214fe8617f721e860878.pdf',
  title: 'Heyzine Publication Catalog',
  url: 'https://heyzine.com/flip-book/1db987b0b7.html',
  pdfUrl: 'https://cdnm.heyzine.com/files/uploaded/1db987b0b7fb34f82476214fe8617f721e860878.pdf',
  totalPages: 156,
  thumbnailUrl: 'https://cdnm.heyzine.com/files/uploaded/1db987b0b7fb34f82476214fe8617f721e860878.pdf-thumb.jpg',
  sections: [
    { page: 1, title: 'Cover & Introduction (p. 1-2)' },
    { page: 3, title: 'Chapter 1: Catalog Main (p. 3-34)' },
    { page: 35, title: 'Chapter 2: Showcase Collection (p. 35-66)' },
    { page: 67, title: 'Chapter 3: Product Highlights (p. 67-98)' },
    { page: 99, title: 'Chapter 4: Premium Series (p. 99-130)' },
    { page: 131, title: 'Chapter 5: Detailed Specifications (p. 131-154)' },
    { page: 155, title: 'Back Cover & Summary (p. 155-156)' },
  ],
};

export function parseHeyzineUrl(inputUrl: string): { id: string; embedUrl: string; pageNumber: number } {
  let cleaned = inputUrl.trim();
  let pageNumber = 1;

  // Extract page hash if present
  const hashMatch = cleaned.match(/#page\/([0-9]+)/);
  if (hashMatch) {
    pageNumber = parseInt(hashMatch[1], 10) || 1;
  }

  // Extract id
  const idMatch = cleaned.match(/flip-book\/([a-zA-Z0-9]+)/) || cleaned.match(/heyzine\.com\/([a-zA-Z0-9]+)/);
  const id = idMatch ? idMatch[1] : '1db987b0b7';

  // Base embed URL
  const base = cleaned.split('#')[0];
  const embedUrl = base.includes('heyzine.com') ? base : `https://heyzine.com/flip-book/${id}.html`;

  return { id, embedUrl, pageNumber };
}
