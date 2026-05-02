import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagInput } from '../components/TagInput';
import { useUpload } from '../hooks/useUpload';
import { useTags } from '../hooks/useTags';
import { MUSICAL_KEYS } from '../utils/helpers';

export function UploadPage() {
  const navigate = useNavigate();
  const { upload, uploading, error } = useUpload();
  const { tags: existingTags, refresh: refreshTags } = useTags();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [key, setKey] = useState('');
  const [notes, setNotes] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setTags([]);
    setKey('');
    setNotes('');
    setPdf(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdf) return;

    try {
      await upload({ title, artist, tags, key: key || undefined, notes: notes || undefined, pdf });
      setSuccess(true);
      refreshTags();
    } catch {
      // Error displayed via hook
    }
  };

  if (success) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Song Uploaded!</h2>
          <p className="text-slate-400 mb-8">&quot;{title}&quot; has been added to your library.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={resetForm} className="btn-primary">
              Add Another
            </button>
            <button onClick={() => navigate('/browse')} className="btn-secondary">
              View Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Add Song</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. From Now On"
            required
            className="input-field"
          />
        </div>

        {/* Artist */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Artist *</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. The Greatest Showman"
            required
            className="input-field"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tags *</label>
          <TagInput
            selectedTags={tags}
            onChange={setTags}
            existingTags={existingTags}
          />
          <p className="text-xs text-slate-500 mt-1">At least one tag required</p>
        </div>

        {/* Key */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Key (optional)</label>
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

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Simplified bridge section"
            rows={2}
            className="input-field resize-none"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">PDF File *</label>
          {pdf ? (
            <div className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-600 rounded-xl">
              <span className="text-2xl">📄</span>
              <span className="flex-1 text-sm text-slate-200 truncate">{pdf.name}</span>
              <button
                type="button"
                onClick={() => {
                  setPdf(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-slate-600 rounded-xl text-slate-400
                hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              <div className="text-3xl mb-2">📄</div>
              <div className="text-sm">Tap to select PDF</div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => setPdf(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !title || !artist || tags.length === 0 || !pdf}
          className="btn-primary w-full text-lg py-4"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            'Upload Song ✓'
          )}
        </button>
      </form>
    </div>
  );
}
