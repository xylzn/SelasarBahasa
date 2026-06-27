'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, LayoutDashboard, Settings, Shield } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Selasar Bahasa
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">Beranda</Link>
            <Link href="/artikel" className="text-gray-700 hover:text-blue-600">Artikel</Link>
            {session?.user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <User size={20} />
                  <span>{session.user?.nama}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </Link>
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <Shield size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">Masuk</Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Daftar
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block text-gray-700 hover:text-blue-600">Beranda</Link>
            <Link href="/artikel" className="block text-gray-700 hover:text-blue-600">Artikel</Link>
            {session?.user ? (
              <>
                <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600">Dashboard</Link>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="block text-gray-700 hover:text-blue-600">Admin Panel</Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full text-left text-red-600 hover:text-red-700"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-700 hover:text-blue-600">Masuk</Link>
                <Link href="/register" className="block text-blue-600 font-medium">Daftar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
