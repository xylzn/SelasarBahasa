'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, BookOpen, HelpCircle, LogOut } from 'lucide-react';

interface SidebarProps {
  userName: string;
  userRole: string;
}

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/materi', icon: BookOpen, label: 'Materi' },
  { href: '/dashboard/quiz', icon: HelpCircle, label: 'Quiz' },
];

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-blue-600">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
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

      <div className="p-4 border-t border-gray-100">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">
            {userRole === 'ADMIN' ? 'Admin' : userRole === 'PREMIUM' ? 'Premium' : 'User'}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </div>
  );
}
