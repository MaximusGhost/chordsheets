import { useState, useEffect } from 'react';
import { getTags } from '../services/api';
import type { TagCount } from '../types';

interface UseTagsResult {
  tags: TagCount[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTags();
      setTags(data.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return { tags, loading, error, refresh: fetchTags };
}
