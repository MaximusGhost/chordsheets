export interface Song {
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

export interface SongsResponse {
  songs: SongSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface TagsResponse {
  tags: TagCount[];
}

export interface CreateSongResponse {
  id: string;
  title: string;
  message: string;
}

export interface SongSearchParams {
  q?: string;
  tag?: string;
  sort?: 'title' | 'dateAdded' | 'artist';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
