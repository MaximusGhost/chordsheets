import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { TagCloud } from '../components/TagCloud';
import { SongList } from '../components/SongList';
import { useSongs } from '../hooks/useSongs';
import { useTags } from '../hooks/useTags';

export function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { tags } = useTags();
  const { songs, loading, error, hasMore, loadMore } = useSongs(
    search
      ? { q: search, sort: 'title', order: 'asc' }
      : { sort: 'dateAdded', order: 'desc', limit: 10 }
  );

  const handleTagClick = (tag: string) => {
    navigate(`/browse?tag=${encodeURIComponent(tag)}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span>♫</span> ChordSheets
        </h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar value={search} onChange={handleSearch} />
      </div>

      {/* Tag Cloud */}
      {!search && tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Tags</h2>
          <TagCloud tags={tags} onTagClick={handleTagClick} />
        </div>
      )}

      {/* Song list */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
          {search ? 'Search Results' : 'Recently Added'}
        </h2>
        <SongList
          songs={songs}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}
