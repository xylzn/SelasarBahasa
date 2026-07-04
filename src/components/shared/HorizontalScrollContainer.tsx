'use client';

import { ReactNode } from 'react';

interface HorizontalScrollContainerProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScrollContainer({
  children,
  className = '',
}: HorizontalScrollContainerProps) {
  return (
    <div className={`relative lg:hidden ${className}`}>
      {/* Gradient fade on right */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {children}
      </div>
    </div>
  );
}
