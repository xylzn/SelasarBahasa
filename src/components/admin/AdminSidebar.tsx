'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/auth';
import { Home, BookOpen, HelpCircle, FileText, Package, MessageSquare, Users, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  userName: string;
}

const navItems = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  { href: '/admin/artikel', icon: FileText, label: 'Artikel' },
  { href: '/admin/materi', icon: BookOpen, label: 'Materi' },
  { href: '/admin/quiz', icon: HelpCircle, label: 'Quiz' },
  { href: '/admin/packages', icon: Package, label: 'Paket' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Pesan' },
  { href: '/admin/users', icon: Users, label: 'Pengguna' },
];

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ redirectTo: '/' });
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="text-xl font-bold text-blue-400">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-white">{userName}</p>
          <p className="text-xs text-gray-400">Admin</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </div>
  );
}
