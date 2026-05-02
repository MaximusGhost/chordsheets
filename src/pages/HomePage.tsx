import { useState, useCallback } from 'react';
import { SearchBar } from '../components/SearchBar';
import { TagCloud } from '../components/TagCloud';
import { SongList } from '../components/SongList';
import { EditSongModal } from '../components/EditSongModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useSongs } from '../hooks/useSongs';
import { useTags } from '../hooks/useTags';
import { getSong, updateSong, deleteSong } from '../services/api';
import type { SongSummary, Song, SongSearchParams } from '../types';

type SortField = 'title' | 'artist' | 'dateAdded';

export function HomePage() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [sort, setSort] = useState<SortField>('dateAdded');
  const { tags, refresh: refreshTags } = useTags();

  // Build query params
  const queryParams: SongSearchParams = {
    sort,
    order: sort === 'dateAdded' ? 'desc' : 'asc',
  };
  if (search) queryParams.q = search;
  if (activeTag) queryParams.tag = activeTag;

  const { songs, total, loading, error, hasMore, loadMore, refresh } = useSongs(queryParams);

  // Edit/delete state
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSongTarget, setDeleteSongTarget] = useState<SongSummary | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTagClick = (tag: string) => {
    setActiveTag(tag === activeTag ? '' : tag);
  };

  const clearTag = () => {
    setActiveTag('');
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  // Edit: fetch full song data then open modal
  const handleEditRequest = useCallback(async (songSummary: SongSummary) => {
    try {
      const fullSong = await getSong(songSummary.id);
      setEditSong(fullSong);
    } catch {
      // Silently fail — could show toast in future
    }
  }, []);

  const handleSave = async (formData: FormData) => {
    if (!editSong) return;
    setSaving(true);
    try {
      await updateSong(editSong.id, formData);
      setEditSong(null);
      refresh();
      refreshTags();
    } catch {
      // Error handled by API client
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = useCallback((song: SongSummary) => {
    setDeleteSongTarget(song);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteSongTarget) return;
    try {
      await deleteSong(deleteSongTarget.id);
      setDeleteSongTarget(null);
      refresh();
      refreshTags();
    } catch {
      // Error handled by API client
    }
  };

  return (
    <div className="px-4 safe-top max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span>♫</span> ChordSheets
        </h1>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar value={search} onChange={handleSearch} />
      </div>

      {/* Active tag filter chip */}
      {activeTag && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-slate-400">Filtered by:</span>
          <span className="tag-chip bg-blue-600 text-white">
            {activeTag}
            <button onClick={clearTag} className="ml-1 hover:text-blue-200">✕</button>
          </span>
        </div>
      )}

      {/* Tag Cloud — show when no active tag filter */}
      {!activeTag && !search && tags.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Tags</h2>
          <TagCloud tags={tags} onTagClick={handleTagClick} />
        </div>
      )}

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">
          {loading ? 'Loading...' : `${total} song${total !== 1 ? 's' : ''}`}
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortField)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="dateAdded">Sort: Newest</option>
          <option value="title">Sort: Title</option>
          <option value="artist">Sort: Artist</option>
        </select>
      </div>

      {/* Song list with swipe actions */}
      <SongList
        songs={songs}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onEdit={handleEditRequest}
        onDelete={handleDeleteRequest}
      />

      {/* Edit Modal */}
      {editSong && (
        <EditSongModal
          open={true}
          song={editSong}
          existingTags={tags}
          onSave={handleSave}
          onClose={() => setEditSong(null)}
          saving={saving}
        />
      )}

      {/* Delete Confirm */}
      {deleteSongTarget && (
        <ConfirmDialog
          open={true}
          title="Delete Song"
          message={`Are you sure you want to delete "${deleteSongTarget.title}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteSongTarget(null)}
        />
      )}
    </div>
  );
}
