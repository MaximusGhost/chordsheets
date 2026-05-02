import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '../components/PDFViewer';
import { useSong } from '../hooks/useSong';

export function SongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { song, loading, error } = useSong(id);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 safe-top flex items-center gap-3 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-sm font-medium text-slate-200 truncate flex-1 text-center">
          {song.title}
        </h1>

        {/* Spacer to balance the back button */}
        <div className="w-12 shrink-0" />
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
    </div>
  );
}
