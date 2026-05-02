export interface SongDocument {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  key?: string;
  notes?: string;
  pdfBlobName: string;
  pdfUrl: string;
  dateAdded: string;
  dateModified: string;
}

export interface SongSummary {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  key?: string;
  dateAdded: string;
}

export interface TagCount {
  name: string;
  count: number;
}
