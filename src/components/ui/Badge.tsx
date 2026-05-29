import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variant === 'success' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        variant === 'warning' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        variant === 'danger' && 'bg-red-500/20 text-red-300 border border-red-500/30',
        variant === 'info' && 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        variant === 'neutral' && 'bg-white/10 text-gray-300 border border-white/20',
        className
      )}
    >
      {children}
    </span>
  );
}
