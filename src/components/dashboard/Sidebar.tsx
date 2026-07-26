'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Home, GraduationCap, HelpCircle, LogOut, FileText } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

interface SidebarProps {
  userName: string;
  userRole: string;
  userEmail: string;
  userFotoProfil: string | null;
  onClose?: () => void;
  className?: string;
}

export default function Sidebar({ userName, userRole, userEmail, userFotoProfil, onClose, className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { data: session } = useSession();

  // Prefer live session foto (updates instantly after upload) over stale server prop
  const liveFoto = (session?.user as any)?.fotoProfil ?? userFotoProfil;

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

  // Get initials from userName
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <Link href="/" onClick={handleLinkClick} className="hover:scale-105 transition-transform duration-200 block inline-block">
          <Image
            src="/images/brand/logo-selasar-bahasa.png"
            alt={t('common.brandName')}
            width={140}
            height={54}
            className="w-auto h-10 object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-600 rounded-full" />
                  )}
                  <Icon size={20} className={isActive ? 'text-green-700' : 'text-gray-400'} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/dashboard/profile"
          onClick={handleLinkClick}
          className="mb-4 bg-gray-50 rounded-2xl p-3 hover:bg-gray-100 transition-colors cursor-pointer block"
        >
          <div className="flex items-center gap-3">
            {liveFoto ? (
              <img
                src={liveFoto}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-brand-blue-dark truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-left text-sm"
        >
          <LogOut size={20} />
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  );
}
