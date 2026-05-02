import { useState } from 'react';
import { createSong } from '../services/api';
import type { CreateSongResponse } from '../types';

interface UseUploadResult {
  upload: (data: {
    title: string;
    artist: string;
    tags: string[];
    key?: string;
    notes?: string;
    pdf: File;
  }) => Promise<CreateSongResponse>;
  uploading: boolean;
  error: string | null;
}

export function useUpload(): UseUploadResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (data: {
    title: string;
    artist: string;
    tags: string[];
    key?: string;
    notes?: string;
    pdf: File;
  }): Promise<CreateSongResponse> => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('artist', data.artist);
      formData.append('tags', JSON.stringify(data.tags));
      if (data.key) formData.append('key', data.key);
      if (data.notes) formData.append('notes', data.notes);
      formData.append('pdf', data.pdf);

      const result = await createSong(formData);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
