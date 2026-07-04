'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLocale();

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-brand-blue hover:scale-105 transition-transform duration-200">
              Selasar Bahasa
            </Link>
          </div>

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
                  <span>{session.user?.nama}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-brand-blue-light/50 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-brand-blue" />
                    <span>{t('navbar.dashboard')}</span>
                  </Link>
                  {session.user?.role === 'ADMIN' && (
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

          <div className="md:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-brand-blue p-1 rounded-lg hover:bg-gray-100/55 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-brand-blue font-medium py-1 transition-colors"
            >
              {t('navbar.home')}
            </Link>
            <Link
              href="/artikel"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-brand-blue font-medium py-1 transition-colors"
            >
              {t('navbar.articles')}
            </Link>
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 hover:text-brand-blue font-medium py-1 transition-colors"
                >
                  {t('navbar.dashboard')}
                </Link>
                {session.user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-brand-blue font-medium py-1 transition-colors"
                  >
                    {t('navbar.adminPanel')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="w-full text-left text-red-600 hover:text-red-700 font-medium py-1 transition-colors"
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center text-gray-700 hover:text-brand-blue font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center bg-brand-blue text-white py-2 rounded-xl font-medium hover:bg-brand-blue/90 transition-colors"
                >
                  {t('navbar.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
