export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${s} border-2 border-indigo-400 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
