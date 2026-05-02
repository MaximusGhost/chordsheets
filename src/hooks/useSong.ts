import { useState, useEffect } from 'react';
import { getSong } from '../services/api';
import type { Song } from '../types';

interface UseSongResult {
  song: Song | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSong(id: string | undefined): UseSongResult {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSong = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSong(id);
      setSong(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load song');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSong();
  }, [id]);

  return { song, loading, error, refresh: fetchSong };
}
