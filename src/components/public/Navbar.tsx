'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, LayoutDashboard, Shield, Home, FileText } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocale();
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const userName = (session?.user as any)?.nama ?? session?.user?.name ?? '';
  const userRole = (session?.user as any)?.role ?? '';
  const fotoProfil = (session?.user as any)?.fotoProfil ?? null;

  const initials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-brand-blue hover:scale-105 transition-transform duration-200">
                Selasar Bahasa
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-brand-blue font-medium transition-colors">
                {t('navbar.home')}
              </Link>
              <Link href="/artikel" className="text-gray-700 hover:text-brand-blue font-medium transition-colors">
                {t('navbar.articles')}
              </Link>
              <LanguageSwitcher />
              {session?.user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-brand-blue font-medium transition-colors">
                    <User size={20} className="text-brand-blue" />
                    <span>{userName}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-brand-blue-light/50 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-brand-blue" />
                      <span>{t('navbar.dashboard')}</span>
                    </Link>
                    {userRole === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-brand-blue-light/50 transition-colors"
                      >
                        <Shield size={16} className="text-brand-blue" />
                        <span>{t('navbar.adminPanel')}</span>
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut size={16} />
                      <span>{t('navbar.logout')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-brand-blue font-medium transition-colors">
                    {t('navbar.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="bg-brand-blue text-white px-5 py-2 rounded-xl font-medium btn-animate hover:bg-brand-blue/90"
                  >
                    {t('navbar.register')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: language + hamburger */}
            <div className="md:hidden flex items-center space-x-3">
              <LanguageSwitcher />
              <button
                onClick={() => setIsOpen(true)}
                className="text-gray-700 hover:text-brand-blue p-1 rounded-lg hover:bg-gray-100/55 transition-colors"
                aria-label="Buka menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white z-[70] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-bold text-brand-blue">
            Selasar Bahasa
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* User info (if logged in) */}
        {session?.user && (
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              {fotoProfil ? (
                <img src={fotoProfil} alt={userName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              pathname === '/' ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home size={18} />
            {t('navbar.home')}
          </Link>
          <Link
            href="/artikel"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              pathname.startsWith('/artikel') ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText size={18} />
            {t('navbar.articles')}
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  pathname.startsWith('/dashboard') ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} />
                {t('navbar.dashboard')}
              </Link>
              {userRole === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pathname.startsWith('/admin') ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Shield size={18} />
                  {t('navbar.adminPanel')}
                </Link>
              )}
            </>
          ) : (
            <div className="pt-2 border-t border-gray-100 space-y-2 mt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-brand-blue hover:text-brand-blue font-medium text-sm transition-colors"
              >
                {t('navbar.login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white font-medium text-sm hover:bg-brand-blue/90 transition-colors"
              >
                {t('navbar.register')}
              </Link>
            </div>
          )}
        </nav>

        {/* Logout at bottom (if logged in) */}
        {session?.user && (
          <div className="px-3 py-4 border-t border-gray-100">
            <button
              onClick={() => { setIsOpen(false); signOut(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition-colors"
            >
              <LogOut size={18} />
              {t('navbar.logout')}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
