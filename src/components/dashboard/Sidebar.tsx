'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, GraduationCap, HelpCircle, LogOut, FileText } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

interface SidebarProps {
  userName: string;
  userRole: string;
  onClose?: () => void;
  className?: string;
}

export default function Sidebar({ userName, userRole, onClose, className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLocale();

  const navItems = [
    { href: '/dashboard', icon: Home, label: t('sidebar.dashboard') },
    { href: '/dashboard/kelas', icon: GraduationCap, label: t('sidebar.classes') },
    { href: '/dashboard/quiz', icon: HelpCircle, label: t('sidebar.quiz') },
    { href: '/dashboard/nilai', icon: FileText, label: t('sidebar.grades') },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`w-64 bg-white border-r border-gray-150 min-h-screen flex flex-col ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <Link href="/" onClick={handleLinkClick} className="text-xl font-bold text-brand-blue hover:scale-105 transition-transform duration-200 block">
          SelasarBahasa
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-blue-light text-brand-blue font-bold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-brand-blue'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-brand-blue' : 'text-gray-400'} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="mb-4 px-4">
          <p className="text-sm font-bold text-brand-blue-dark">{userName}</p>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            {userRole === 'ADMIN' ? t('sidebar.admin') : userRole === 'PREMIUM' ? t('sidebar.premium') : t('sidebar.user')}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:font-bold transition-all duration-200 text-left text-sm"
        >
          <LogOut size={20} />
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  );
}
