import type { TagCount } from '../types';

interface TagCloudProps {
  tags: TagCount[];
  onTagClick: (tag: string) => void;
  activeTag?: string;
}

export function TagCloud({ tags, onTagClick, activeTag }: TagCloudProps) {
  if (tags.length === 0) return null;

  const sorted = [...tags].sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((tag) => (
        <button
          key={tag.name}
          onClick={() => onTagClick(tag.name)}
          className={`tag-chip-interactive ${
            activeTag === tag.name
              ? 'bg-blue-600 text-white'
              : ''
          }`}
        >
          {tag.name}
          <span className="text-xs opacity-70">({tag.count})</span>
        </button>
      ))}
    </div>
  );
}
