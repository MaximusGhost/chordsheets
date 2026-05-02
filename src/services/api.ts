import type {
  Song,
  SongsResponse,
  TagsResponse,
  CreateSongResponse,
  SongSearchParams,
} from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Unknown error');
    throw new Error(`API error ${res.status}: ${errorBody}`);
  }
  return res.json() as Promise<T>;
}

export async function getSongs(params?: SongSearchParams): Promise<SongsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.order) searchParams.set('order', params.order);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const qs = searchParams.toString();
  return request<SongsResponse>(`${API_BASE}/songs${qs ? `?${qs}` : ''}`);
}

export async function getSong(id: string): Promise<Song> {
  return request<Song>(`${API_BASE}/songs/${id}`);
}

export async function createSong(formData: FormData): Promise<CreateSongResponse> {
  return request<CreateSongResponse>(`${API_BASE}/songs`, {
    method: 'POST',
    body: formData,
  });
}

export async function updateSong(id: string, formData: FormData): Promise<{ id: string; message: string }> {
  return request<{ id: string; message: string }>(`${API_BASE}/songs/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

export async function deleteSong(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`${API_BASE}/songs/${id}`, {
    method: 'DELETE',
  });
}

export async function getTags(): Promise<TagsResponse> {
  return request<TagsResponse>(`${API_BASE}/tags`);
}
