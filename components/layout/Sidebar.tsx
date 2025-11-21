'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Add Data', href: '/add-data', icon: '➕' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-60 bg-livith-black-90 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-livith-white text-xl font-bold flex items-center gap-2">
          <span className="bg-livith-yellow-60 text-livith-black-100 w-8 h-8 rounded flex items-center justify-center">
            📋
          </span>
          Admin Panel
        </h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-livith-yellow-60 text-livith-black-100'
                      : 'text-livith-white hover:bg-livith-black-80'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-4 border-t border-livith-black-50">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-livith-black-30 hover:text-livith-white hover:bg-livith-black-80"
        >
          🚪 로그아웃
        </Button>
      </div>
    </div>
  );
}
