import { useState, useRef, useEffect } from 'react';
import type { TagCount } from '../types';

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  existingTags: TagCount[];
}

export function TagInput({ selectedTags, onChange, existingTags }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = existingTags
    .filter(
      (t) =>
        t.name.toLowerCase().includes(input.toLowerCase()) &&
        !selectedTags.includes(t.name)
    )
    .slice(0, 8);

  const exactMatch = existingTags.some(
    (t) => t.name.toLowerCase() === input.toLowerCase()
  );
  const alreadySelected = selectedTags.some(
    (t) => t.toLowerCase() === input.toLowerCase()
  );
  const showCreateOption = input.trim() && !exactMatch && !alreadySelected;

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized && !selectedTags.includes(normalized)) {
      onChange([...selectedTags, normalized]);
    }
    setInput('');
    setShowDropdown(false);
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="input-field flex flex-wrap gap-2 min-h-[48px] cursor-text"
        onClick={() => {
          const inputEl = containerRef.current?.querySelector('input');
          inputEl?.focus();
        }}
      >
        {selectedTags.map((tag) => (
          <span key={tag} className="tag-chip bg-blue-600 text-white">
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-1 hover:text-blue-200"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              e.preventDefault();
              addTag(input);
            }
            if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
              removeTag(selectedTags[selectedTags.length - 1]);
            }
          }}
          placeholder={selectedTags.length === 0 ? 'Type to add tags...' : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-slate-100 placeholder-slate-400"
        />
      </div>

      {showDropdown && (showCreateOption || filtered.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-xl shadow-lg overflow-hidden">
          {showCreateOption && (
            <button
              onClick={() => addTag(input)}
              className="w-full text-left px-4 py-3 hover:bg-slate-600 text-blue-400 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Create new tag: &quot;{input.trim().toLowerCase()}&quot;
            </button>
          )}
          {filtered.map((tag) => (
            <button
              key={tag.name}
              onClick={() => addTag(tag.name)}
              className="w-full text-left px-4 py-3 hover:bg-slate-600 text-slate-200 flex justify-between"
            >
              <span>{tag.name}</span>
              <span className="text-slate-400 text-sm">({tag.count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
