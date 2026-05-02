import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SongSummary } from '../types';

interface SongCardProps {
  song: SongSummary;
  onEdit?: (song: SongSummary) => void;
  onDelete?: (song: SongSummary) => void;
}

const SWIPE_THRESHOLD = 60;
const ACTION_WIDTH = 140; // total width of both action buttons

export function SongCard({ song, onEdit, onDelete }: SongCardProps) {
  const navigate = useNavigate();
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = offset;
    isDragging.current = false;
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startXRef.current;
    const newOffset = Math.min(0, Math.max(-ACTION_WIDTH, currentXRef.current + deltaX));
    if (Math.abs(deltaX) > 5) {
      isDragging.current = true;
    }
    setOffset(newOffset);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (offset < -SWIPE_THRESHOLD) {
      setOffset(-ACTION_WIDTH);
      setSwiped(true);
    } else {
      setOffset(0);
      setSwiped(false);
    }
  }, [offset]);

  const resetSwipe = useCallback(() => {
    setOffset(0);
    setSwiped(false);
  }, []);

  const handleCardClick = useCallback(() => {
    if (isDragging.current) return;
    if (swiped) {
      resetSwipe();
      return;
    }
    navigate(`/songs/${song.id}`);
  }, [swiped, navigate, song.id, resetSwipe]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons behind the card */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => {
            resetSwipe();
            onEdit?.(song);
          }}
          className="w-[70px] bg-blue-600 text-white flex items-center justify-center text-sm font-medium active:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => {
            resetSwipe();
            onDelete?.(song);
          }}
          className="w-[70px] bg-red-600 text-white flex items-center justify-center text-sm font-medium active:bg-red-700"
        >
          Delete
        </button>
      </div>

      {/* Swipeable card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        className="card w-full text-left relative z-10 cursor-pointer select-none"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s ease-out',
        }}
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
      </div>
    </div>
  );
}
