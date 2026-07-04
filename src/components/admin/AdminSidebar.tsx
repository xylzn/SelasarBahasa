'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/auth';
import { Home, BookOpen, FileText, Package, Users, LogOut, ClipboardList } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

interface AdminSidebarProps {
  userName: string;
  onClose?: () => void;
  className?: string;
}

export default function AdminSidebar({ userName, onClose, className = '' }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useLocale();

  const navItems = [
    { href: '/admin', icon: Home, label: t('sidebar.dashboard') },
    { href: '/admin/artikel', icon: FileText, label: t('sidebar.articles') },
    { href: '/admin/materi', icon: BookOpen, label: t('sidebar.materials') },
    { href: '/admin/quiz', icon: BookOpen, label: t('sidebar.quiz') },
    { href: '/admin/tugas', icon: ClipboardList, label: t('sidebar.tasks') },
    { href: '/admin/packages', icon: Package, label: t('sidebar.packages') },
    { href: '/admin/users', icon: Users, label: t('sidebar.users') },
  ];

  const handleSignOut = async () => {
    await signOut({ redirectTo: '/' });
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`w-64 bg-brand-blue-dark text-white min-h-screen flex flex-col ${className}`}>
      <div className="p-6 border-b border-gray-800">
        <Link href="/" onClick={handleLinkClick} className="text-xl font-bold text-brand-orange hover:scale-105 transition-transform duration-200 block">
          SelasarBahasa Admin
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
                      ? 'bg-brand-blue text-white font-bold shadow-md'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 px-4">
          <p className="text-sm font-bold text-white">{userName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('sidebar.admin')}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 text-left text-sm"
        >
          <LogOut size={20} />
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  );
}
