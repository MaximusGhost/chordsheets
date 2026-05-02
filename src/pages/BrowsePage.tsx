import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { SongList } from '../components/SongList';
import { useSongs } from '../hooks/useSongs';
import { useTags } from '../hooks/useTags';
import type { SongSearchParams } from '../types';

type SortField = 'title' | 'artist' | 'dateAdded';

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');
  const [sort, setSort] = useState<SortField>('title');
  const { tags } = useTags();

  useEffect(() => {
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    if (q !== null) setSearch(q);
    if (tag !== null) setActiveTag(tag);
  }, [searchParams]);

  const queryParams: SongSearchParams = {
    sort,
    order: sort === 'dateAdded' ? 'desc' : 'asc',
  };
  if (search) queryParams.q = search;
  if (activeTag) queryParams.tag = activeTag;

  const { songs, total, loading, error, hasMore, loadMore } = useSongs(queryParams);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (activeTag) params.set('tag', activeTag);
    setSearchParams(params);
  };

  const handleTagSelect = (tag: string) => {
    const newTag = tag === activeTag ? '' : tag;
    setActiveTag(newTag);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (newTag) params.set('tag', newTag);
    setSearchParams(params);
  };

  const clearTag = () => {
    setActiveTag('');
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    setSearchParams(params);
  };

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Browse Library</h1>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar value={search} onChange={handleSearch} />
      </div>

      {/* Active tag filter */}
      {activeTag && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-slate-400">Filtered by:</span>
          <span className="tag-chip bg-blue-600 text-white">
            {activeTag}
            <button onClick={clearTag} className="ml-1 hover:text-blue-200">✕</button>
          </span>
        </div>
      )}

      {/* Tag dropdown */}
      {!activeTag && tags.length > 0 && (
        <div className="mb-4">
          <select
            value=""
            onChange={(e) => handleTagSelect(e.target.value)}
            className="input-field text-sm"
          >
            <option value="">Filter by tag...</option>
            {tags.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>
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
          <option value="title">Sort: Title</option>
          <option value="artist">Sort: Artist</option>
          <option value="dateAdded">Sort: Newest</option>
        </select>
      </div>

      {/* Song list */}
      <SongList
        songs={songs}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
