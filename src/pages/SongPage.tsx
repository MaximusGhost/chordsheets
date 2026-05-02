import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '../components/PDFViewer';
import { EditSongModal } from '../components/EditSongModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useSong } from '../hooks/useSong';
import { useTags } from '../hooks/useTags';
import { updateSong, deleteSong } from '../services/api';

export function SongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { song, loading, error, refresh } = useSong(id);
  const { tags } = useTags();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-400">{error || 'Song not found'}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  const handleSave = async (formData: FormData) => {
    setSaving(true);
    try {
      await updateSong(song.id, formData);
      setShowEdit(false);
      refresh();
    } catch {
      // Error is handled by the API client
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSong(song.id);
      navigate('/browse', { replace: true });
    } catch {
      // Error handling
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-sm font-medium text-slate-200 truncate mx-4 flex-1 text-center">
          {song.title}
        </h1>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-xl shadow-lg overflow-hidden w-40 z-20">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowEdit(true);
                }}
                className="w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDelete(true);
                }}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Song info bar */}
      <div className="bg-slate-800/50 px-4 py-2 flex items-center gap-3 text-sm border-b border-slate-700/50">
        <span className="text-slate-300">{song.artist}</span>
        {song.key && (
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{song.key}</span>
          </>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="flex-1">
        <PDFViewer url={song.pdfUrl} />
      </div>

      {/* Edit Modal */}
      <EditSongModal
        open={showEdit}
        song={song}
        existingTags={tags}
        onSave={handleSave}
        onClose={() => setShowEdit(false)}
        saving={saving}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={showDelete}
        title="Delete Song"
        message={`Are you sure you want to delete "${song.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      {/* Click outside menu to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
