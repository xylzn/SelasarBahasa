'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SelasarBahasa
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Beranda
            </Link>
            <Link href="/artikel" className="text-gray-700 hover:text-blue-600">
              Artikel
            </Link>
            <Link href="/#packages" className="text-gray-700 hover:text-blue-600">
              Paket
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-blue-600">
              Kontak
            </Link>
            <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700">
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Daftar
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              Beranda
            </Link>
            <Link
              href="/artikel"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              Artikel
            </Link>
            <Link
              href="/#packages"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              Paket
            </Link>
            <Link
              href="/#contact"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-blue-600"
            >
              Kontak
            </Link>
            <div className="pt-4 border-t space-y-3">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-blue-600 font-medium"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
