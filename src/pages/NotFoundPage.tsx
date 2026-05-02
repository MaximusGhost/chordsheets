import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <div className="text-6xl">🎵</div>
      <h1 className="text-2xl font-bold text-slate-100">Page Not Found</h1>
      <p className="text-slate-400 text-center">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <button onClick={() => navigate('/')} className="btn-primary">
        Go Home
      </button>
    </div>
  );
}
