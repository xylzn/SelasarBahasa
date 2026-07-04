'use client';

import { ReactNode } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function MobileDrawer({ isOpen, onClose, children, className = '' }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 backdrop-blur-sm bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        {children}
      </div>
    </>
  );
}
