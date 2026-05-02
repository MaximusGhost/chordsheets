import { useState, useEffect, useCallback } from 'react';
import { getSongs } from '../services/api';
import type { SongSummary, SongSearchParams } from '../types';

interface UseSongsResult {
  songs: SongSummary[];
  total: number;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  hasMore: boolean;
}

export function useSongs(params?: SongSearchParams): UseSongsResult {
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = params?.limit ?? 50;

  const fetchSongs = useCallback(
    async (currentOffset: number, append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSongs({
          ...params,
          limit,
          offset: currentOffset,
        });
        setSongs((prev) => (append ? [...prev, ...res.songs] : res.songs));
        setTotal(res.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load songs');
      } finally {
        setLoading(false);
      }
    },
    [params?.q, params?.tag, params?.sort, params?.order, limit]
  );

  useEffect(() => {
    setOffset(0);
    setSongs([]);
    fetchSongs(0, false);
  }, [fetchSongs]);

  const loadMore = useCallback(() => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchSongs(newOffset, true);
  }, [offset, limit, fetchSongs]);

  const refresh = useCallback(() => {
    setOffset(0);
    setSongs([]);
    fetchSongs(0, false);
  }, [fetchSongs]);

  return {
    songs,
    total,
    loading,
    error,
    loadMore,
    refresh,
    hasMore: songs.length < total,
  };
}
