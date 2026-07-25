'use client';

import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import SearchBar from '@/components/shared/SearchBar';
import { MobileDrawer } from '@/components/shared/MobileDrawer';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { useLocale } from '@/components/providers/LocaleProvider';
import PremiumExpiryModal from './PremiumExpiryModal';
import ContentProtectionWrapper from '@/components/shared/ContentProtectionWrapper';

interface DashboardLayoutContentProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  userEmail: string;
  userFotoProfil: string | null;
}

export default function DashboardLayoutContent({
  children,
  userName,
  userRole,
  userEmail,
  userFotoProfil,
}: DashboardLayoutContentProps) {
  const { isOpen, toggle, close } = useSidebarToggle();
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen">
      <PremiumExpiryModal />
      
      {/* Desktop Sidebar (always visible) */}
      <div className="hidden lg:block">
        <Sidebar userName={userName} userRole={userRole} userEmail={userEmail} userFotoProfil={userFotoProfil} />
      </div>

      {/* Mobile Drawer Sidebar */}
      <MobileDrawer isOpen={isOpen} onClose={close}>
        <Sidebar
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          userFotoProfil={userFotoProfil}
          onClose={close}
          className="w-full border-r-0"
        />
      </MobileDrawer>

      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Desktop greeting (desktop only) */}
          <p className="hidden lg:block text-sm text-gray-500">
            {t('dashboard.greeting')} <span className="font-semibold text-gray-800">{userName}</span>
          </p>

          <div className="flex-1 max-w-lg ml-auto">
            <SearchBar />
          </div>
        </header>
        <main className="flex-1 bg-gray-50">
          <ContentProtectionWrapper>
            {children}
          </ContentProtectionWrapper>
        </main>
      </div>
    </div>
  );
}
