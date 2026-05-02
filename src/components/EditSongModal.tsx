import { useState, useEffect } from 'react';
import { TagInput } from './TagInput';
import { MUSICAL_KEYS } from '../utils/helpers';
import type { Song, TagCount } from '../types';

interface EditSongModalProps {
  open: boolean;
  song: Song;
  existingTags: TagCount[];
  onSave: (formData: FormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export function EditSongModal({
  open,
  song,
  existingTags,
  onSave,
  onClose,
  saving,
}: EditSongModalProps) {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [tags, setTags] = useState<string[]>(song.tags);
  const [key, setKey] = useState(song.key || '');
  const [notes, setNotes] = useState(song.notes || '');
  const [pdf, setPdf] = useState<File | null>(null);

  useEffect(() => {
    setTitle(song.title);
    setArtist(song.artist);
    setTags(song.tags);
    setKey(song.key || '');
    setNotes(song.notes || '');
    setPdf(null);
  }, [song]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('tags', JSON.stringify(tags));
    if (key) formData.append('key', key);
    if (notes) formData.append('notes', notes);
    if (pdf) formData.append('pdf', pdf);
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/60 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-100">Edit Song</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Artist *</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tags *</label>
            <TagInput
              selectedTags={tags}
              onChange={setTags}
              existingTags={existingTags}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Key</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="input-field"
            >
              <option value="">No key specified</option>
              {MUSICAL_KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Replace PDF (optional)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdf(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0 file:text-sm file:font-medium
                file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title || !artist || tags.length === 0}
              className="btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
