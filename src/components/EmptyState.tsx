interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No songs found' }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎵</div>
      <p className="text-slate-400 text-lg">{message}</p>
    </div>
  );
}
