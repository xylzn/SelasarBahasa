'use client';

import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { MobileDrawer } from '@/components/shared/MobileDrawer';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';

interface AdminLayoutContentProps {
  children: ReactNode;
  userName: string;
}

export default function AdminLayoutContent({
  children,
  userName,
}: AdminLayoutContentProps) {
  const { isOpen, toggle, close } = useSidebarToggle();

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar (always visible) */}
      <div className="hidden lg:block">
        <AdminSidebar userName={userName} />
      </div>

      {/* Mobile Drawer Sidebar */}
      <MobileDrawer isOpen={isOpen} onClose={close}>
        <AdminSidebar
          userName={userName}
          onClose={close}
          className="w-full border-r-0"
        />
      </MobileDrawer>

      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <header className="bg-white border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          <h1 className="text-xl font-bold text-gray-900 ml-4 lg:ml-0">Admin Panel</h1>
        </header>
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
