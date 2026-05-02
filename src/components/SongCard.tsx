import { useNavigate } from 'react-router-dom';
import type { SongSummary } from '../types';

interface SongCardProps {
  song: SongSummary;
}

export function SongCard({ song }: SongCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/songs/${song.id}`)}
      className="card w-full text-left active:scale-[0.98] transition-transform"
    >
      <h3 className="font-semibold text-slate-100 text-lg truncate">{song.title}</h3>
      <p className="text-slate-400 text-sm truncate">{song.artist}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {song.key && (
          <span className="text-xs bg-slate-600 text-slate-200 px-2 py-0.5 rounded">
            {song.key}
          </span>
        )}
        {song.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="tag-chip text-xs">
            {tag}
          </span>
        ))}
        {song.tags.length > 3 && (
          <span className="text-xs text-slate-500">+{song.tags.length - 3}</span>
        )}
      </div>
    </button>
  );
}
