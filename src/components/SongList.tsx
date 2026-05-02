import { SongCard } from './SongCard';
import { EmptyState } from './EmptyState';
import type { SongSummary } from '../types';

interface SongListProps {
  songs: SongSummary[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function SongList({ songs, loading, error, hasMore, onLoadMore }: SongListProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!loading && songs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="grid gap-3">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          className="btn-secondary w-full mt-4"
        >
          Load More
        </button>
      )}
    </div>
  );
}
