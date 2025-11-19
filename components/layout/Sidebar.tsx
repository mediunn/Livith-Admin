'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

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
    </div>
  );
}
