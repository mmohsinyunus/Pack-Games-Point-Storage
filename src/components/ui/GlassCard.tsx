import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  suit?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, suit, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-5 relative overflow-hidden',
        hover && 'transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer',
        className
      )}
    >
      {suit && (
        <span
          className="absolute bottom-2 right-3 text-6xl opacity-[0.06] select-none pointer-events-none font-bold"
          aria-hidden="true"
        >
          {suit}
        </span>
      )}
      {children}
    </div>
  );
}
